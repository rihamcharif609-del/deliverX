<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        User::where('status', 'suspended')
            ->whereNotNull('suspended_until')
            ->where('suspended_until', '<=', now())
            ->update([
                'status' => 'active',
                'suspended_at' => null,
                'suspended_until' => null,
                'suspension_reason' => null,
            ]);

        $monthlyRevenue = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthlyRevenue[] = (float) Delivery::where('payment_status', '!=', 'unpaid')
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', $month)
                ->sum('amount');
        }

        return response()->json([
            'data' => [
                'total_users' => User::count(),
                'active_users' => User::where('status', 'active')->count(),
                'suspended_users' => User::where('status', 'suspended')->count(),
                'total_deliveries' => Delivery::count(),
                'active_couriers' => User::where('role', UserRole::Courier->value)
                    ->where('status', 'active')
                    ->count(),
                'total_revenue' => (float) Delivery::where('payment_status', '!=', 'unpaid')->sum('amount'),
                'platform_profit' => (float) Delivery::whereIn('payment_status', ['held', 'released'])->sum('commission'),
                'courier_earnings' => (float) (Delivery::whereIn('payment_status', ['held', 'released'])->sum('amount') - Delivery::whereIn('payment_status', ['held', 'released'])->sum('commission')),
                'held_in_escrow' => (float) Delivery::where('payment_status', 'held')->sum('amount'),
                'released_payouts' => (float) Delivery::where('payment_status', 'released')->sum('amount'),
                'refunds_issued' => (float) Delivery::where('payment_status', 'refunded')->sum('amount'),
                'ratings' => RatingController::adminRatingSummary(),
                'monthly_revenue' => $monthlyRevenue,
                'recent_users' => User::query()
                    ->whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
                    ->withCount(['sentDeliveries', 'courierDeliveries'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(function (User $user) {
                        $deliveries = match ($user->role) {
                            UserRole::Sender => $user->sent_deliveries_count,
                            UserRole::Courier => $user->courier_deliveries_count,
                            UserRole::Admin => 0,
                        };

                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role->value,
                            'status' => $user->status,
                            'is_suspended' => $user->status === 'suspended',
                            'suspended_at' => $user->suspended_at?->toIso8601String(),
                            'suspended_until' => $user->suspended_until?->toIso8601String(),
                            'suspension_reason' => $user->suspension_reason,
                            'joined' => $user->created_at?->format('Y-m-d'),
                            'deliveries' => $deliveries,
                            'profile_photo' => $user->profile_photo,
                        ];
                    }),
            ],
        ]);
    }
}
