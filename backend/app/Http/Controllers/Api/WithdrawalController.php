<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class WithdrawalController extends Controller
{
    public function courierWallet(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->walletSummary($request->user()),
        ]);
    }

    public function courierIndex(Request $request): JsonResponse
    {
        return response()->json([
            'data' => Withdrawal::query()
                ->where('courier_id', $request->user()->id)
                ->latest('requested_at')
                ->get()
                ->map(fn (Withdrawal $withdrawal) => $this->formatWithdrawal($withdrawal)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'bank_name' => ['required', 'string', 'max:255'],
            'rib' => ['required', 'regex:/^\d{24}$/'],
        ]);

        $wallet = $this->walletSummary($request->user());

        if ((float) $data['amount'] > $wallet['released_balance']) {
            return response()->json([
                'message' => 'Insufficient released balance.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $withdrawal = Withdrawal::create([
            'courier_id' => $request->user()->id,
            'amount' => $data['amount'],
            'bank_name' => $data['bank_name'],
            'rib' => $data['rib'],
            'status' => Withdrawal::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        return response()->json([
            'data' => $this->formatWithdrawal($withdrawal->load('courier')),
            'wallet' => $this->walletSummary($request->user()),
        ], Response::HTTP_CREATED);
    }

    public function adminIndex(): JsonResponse
    {
        $withdrawals = Withdrawal::query()
            ->with('courier')
            ->latest('requested_at')
            ->get()
            ->map(fn (Withdrawal $withdrawal) => $this->formatWithdrawal($withdrawal));

        return response()->json([
            'data' => $withdrawals,
        ]);
    }

    public function adminDecision(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in([Withdrawal::STATUS_APPROVED, Withdrawal::STATUS_REJECTED])],
        ]);

        if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
            return response()->json([
                'message' => 'This withdrawal has already been processed.',
            ], Response::HTTP_CONFLICT);
        }

        if ($data['status'] === Withdrawal::STATUS_APPROVED) {
            $wallet = $this->walletSummary($withdrawal->courier);

            if ((float) $withdrawal->amount > $wallet['released_balance']) {
                return response()->json([
                    'message' => 'Courier no longer has enough released balance.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $withdrawal->update([
            'status' => $data['status'],
            'processed_at' => now(),
        ]);

        return response()->json([
            'data' => $this->formatWithdrawal($withdrawal->refresh()->load('courier')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function walletSummary(User $courier): array
    {
        if ($courier->role !== UserRole::Courier) {
            return [
                'escrow_balance' => 0.0,
                'released_balance' => 0.0,
                'total_earnings' => 0.0,
                'withdrawn_total' => 0.0,
                'pending_withdrawals' => 0.0,
                'withdraw_history' => [],
            ];
        }

        $escrow = (float) $courier->courierPayments()
            ->where('status', Payment::STATUS_HELD)
            ->sum('net_amount');

        $releasedGross = (float) $courier->courierPayments()
            ->where('status', Payment::STATUS_RELEASED)
            ->sum('net_amount');

        $approvedWithdrawals = (float) $courier->withdrawals()
            ->where('status', Withdrawal::STATUS_APPROVED)
            ->sum('amount');

        $pendingWithdrawals = (float) $courier->withdrawals()
            ->where('status', Withdrawal::STATUS_PENDING)
            ->sum('amount');

        $history = $courier->withdrawals()
            ->latest('requested_at')
            ->get()
            ->map(fn (Withdrawal $withdrawal) => $this->formatWithdrawal($withdrawal));

        return [
            'escrow_balance' => round($escrow, 2),
            'released_balance' => round(max(0, $releasedGross - $approvedWithdrawals - $pendingWithdrawals), 2),
            'total_earnings' => round($escrow + $releasedGross, 2),
            'withdrawn_total' => round($approvedWithdrawals, 2),
            'pending_withdrawals' => round($pendingWithdrawals, 2),
            'withdraw_history' => $history,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatWithdrawal(Withdrawal $withdrawal): array
    {
        return [
            'id' => $withdrawal->id,
            'courier_id' => $withdrawal->courier_id,
            'courier_name' => $withdrawal->courier?->name,
            'amount' => (float) $withdrawal->amount,
            'bank_name' => $withdrawal->bank_name,
            'rib' => $withdrawal->rib,
            'status' => $withdrawal->status,
            'requested_at' => $withdrawal->requested_at?->toIso8601String(),
            'processed_at' => $withdrawal->processed_at?->toIso8601String(),
        ];
    }
}
