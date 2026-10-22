<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeliveryRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class DeliveryController extends Controller
{
    public function adminIndex(): AnonymousResourceCollection
    {
        return DeliveryResource::collection(
            Delivery::with(['sender', 'courier', 'payment', 'rating'])->latest()->paginate()
        );
    }

    public function senderIndex(Request $request): AnonymousResourceCollection
    {
        return DeliveryResource::collection(
            Delivery::with(['sender', 'courier', 'payment', 'rating'])
                ->where('sender_id', $request->user()->id)
                ->latest()
                ->paginate()
        );
    }

    public function courierAvailable(Request $request): AnonymousResourceCollection|JsonResponse
    {
        if (($request->user()->verification_status ?? 'draft') !== 'approved') {
            return response()->json([
                'message' => 'Your courier profile must be verified before viewing available deliveries.',
            ], Response::HTTP_FORBIDDEN);
        }

        return DeliveryResource::collection(
            Delivery::with('sender')->available()->latest()->paginate()
        );
    }

    public function courierIndex(Request $request): AnonymousResourceCollection
    {
        return DeliveryResource::collection(
            Delivery::with(['sender', 'courier', 'payment', 'rating'])
                ->where('courier_id', $request->user()->id)
                ->latest()
                ->paginate()
        );
    }

    public function accept(Request $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        if (($request->user()->verification_status ?? 'draft') !== 'approved') {
            return response()->json([
                'message' => 'Your courier profile must be verified before accepting deliveries.',
            ], Response::HTTP_FORBIDDEN);
        }

        if ($delivery->courier_id || $delivery->status !== Delivery::STATUS_WAITING_COURIER) {
            return response()->json([
                'message' => 'This delivery is no longer available.',
            ], Response::HTTP_CONFLICT);
        }

        $delivery->update([
            'courier_id' => $request->user()->id,
            'status' => Delivery::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

        return new DeliveryResource($delivery->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function pay(Request $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        if ($delivery->sender_id !== $request->user()->id) {
            return $this->forbidden();
        }

        if ($delivery->status !== Delivery::STATUS_ACCEPTED || ! $delivery->courier_id) {
            return response()->json([
                'message' => 'This delivery must be accepted by a courier before payment.',
            ], Response::HTTP_CONFLICT);
        }

        if ($delivery->payment_status !== 'unpaid') {
            return response()->json([
                'message' => 'This delivery has already been paid.',
            ], Response::HTTP_CONFLICT);
        }

        $data = $request->validate([
            'card_holder' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($delivery, $data) {
            $paidAt = now();
            $commission = (float) $delivery->commission;
            $amount = (float) $delivery->amount;

            $delivery->update([
                'status' => Delivery::STATUS_PAID,
                'payment_status' => Payment::STATUS_HELD,
                'delivery_otp' => (string) random_int(1000, 9999),
                'payment_card_holder' => $data['card_holder'],
                'paid_at' => $paidAt,
            ]);

            Payment::create([
                'delivery_id' => $delivery->id,
                'sender_id' => $delivery->sender_id,
                'courier_id' => $delivery->courier_id,
                'transaction_reference' => Payment::makeReference(),
                'amount' => $amount,
                'commission' => $commission,
                'net_amount' => $amount - $commission,
                'status' => Payment::STATUS_HELD,
                'card_holder' => $data['card_holder'],
                'paid_at' => $paidAt,
            ]);
        });

        return new DeliveryResource($delivery->refresh()->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function courierStatus(Request $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        if ($delivery->courier_id !== $request->user()->id) {
            return $this->forbidden();
        }

        $data = $request->validate([
            'status' => ['required', Rule::in([
                Delivery::STATUS_PICKED_UP,
                Delivery::STATUS_IN_TRANSIT,
            ])],
        ]);

        if ($data['status'] === Delivery::STATUS_PICKED_UP && $delivery->status !== Delivery::STATUS_PAID) {
            return response()->json([
                'message' => 'Sender payment is required before pickup can be confirmed.',
            ], Response::HTTP_CONFLICT);
        }

        if ($data['status'] === Delivery::STATUS_IN_TRANSIT && $delivery->status !== Delivery::STATUS_PICKED_UP) {
            return response()->json([
                'message' => 'Pickup must be confirmed before starting transit.',
            ], Response::HTTP_CONFLICT);
        }

        $delivery->update([
            'status' => $data['status'],
            'picked_up_at' => $data['status'] === Delivery::STATUS_PICKED_UP
                ? ($delivery->picked_up_at ?? now())
                : $delivery->picked_up_at,
        ]);

        return new DeliveryResource($delivery->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function confirmOtp(Request $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        if ($delivery->courier_id !== $request->user()->id) {
            return $this->forbidden();
        }

        $data = $request->validate([
            'otp' => ['required', 'digits:4'],
        ]);

        if ($delivery->status !== Delivery::STATUS_IN_TRANSIT || $delivery->payment_status !== 'held') {
            return response()->json([
                'message' => 'This delivery is not ready for OTP confirmation.',
            ], Response::HTTP_CONFLICT);
        }

        if (! hash_equals((string) $delivery->delivery_otp, (string) $data['otp'])) {
            return response()->json([
                'message' => 'Invalid OTP code! Please try again.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::transaction(function () use ($delivery) {
            $delivery->update([
                'status' => Delivery::STATUS_DELIVERED,
                'payment_status' => Payment::STATUS_RELEASED,
                'delivered_at' => now(),
            ]);

            $delivery->payment?->update([
                'status' => Payment::STATUS_RELEASED,
                'released_at' => now(),
            ]);
        });

        return new DeliveryResource($delivery->refresh()->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function store(DeliveryRequest $request): JsonResponse
    {
        $delivery = Delivery::create([
            ...$request->safe()->except(['courier_id', 'tracking_code']),
            'sender_id' => $request->user()->id,
            'status' => Delivery::STATUS_WAITING_COURIER,
            'payment_status' => $request->input('payment_status', 'unpaid'),
        ]);

        return (new DeliveryResource($delivery->load(['sender', 'courier', 'payment', 'rating'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        if (! $this->canView($request, $delivery)) {
            return $this->forbidden();
        }

        return new DeliveryResource($delivery->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function update(DeliveryRequest $request, Delivery $delivery): DeliveryResource|JsonResponse
    {
        $data = $request->safe()->except(['sender_id', 'tracking_code']);

        if (! $this->canManage($request, $delivery, $data)) {
            return $this->forbidden();
        }

        if (array_key_exists('courier_id', $data) && $data['courier_id']) {
            $data['status'] = $data['status'] ?? Delivery::STATUS_ACCEPTED;
            $data['accepted_at'] = $delivery->accepted_at ?? now();
        }

        if (($data['status'] ?? null) === Delivery::STATUS_PICKED_UP) {
            $data['picked_up_at'] = $delivery->picked_up_at ?? now();
        }

        if (($data['status'] ?? null) === Delivery::STATUS_DELIVERED) {
            $data['delivered_at'] = $delivery->delivered_at ?? now();
            $data['payment_status'] = $data['payment_status'] ?? 'released';
        }

        DB::transaction(function () use ($delivery, $data) {
            $delivery->update($data);

            if (array_key_exists('payment_status', $data)) {
                $paymentStatus = $data['payment_status'];
                if ($delivery->payment) {
                    $paymentUpdate = ['status' => $paymentStatus];
                    if ($paymentStatus === Payment::STATUS_RELEASED) {
                        $paymentUpdate['released_at'] = now();
                    } elseif ($paymentStatus === Payment::STATUS_REFUNDED) {
                        $paymentUpdate['refunded_at'] = now();
                    }
                    $delivery->payment->update($paymentUpdate);
                }
            }
        });

        return new DeliveryResource($delivery->refresh()->load(['sender', 'courier', 'payment', 'rating']));
    }

    public function destroy(Request $request, Delivery $delivery): JsonResponse
    {
        if (! $this->canManage($request, $delivery)) {
            return $this->forbidden();
        }

        $delivery->delete();

        return response()->json(['message' => 'Delivery deleted successfully.']);
    }

    private function canView(Request $request, Delivery $delivery): bool
    {
        $user = $request->user();

        return match ($user->role) {
            UserRole::Admin => true,
            UserRole::Sender => $delivery->sender_id === $user->id,
            UserRole::Courier => $delivery->courier_id === $user->id || (
                $delivery->courier_id === null &&
                $delivery->status === Delivery::STATUS_WAITING_COURIER
            ),
        };
    }

    private function canManage(Request $request, Delivery $delivery, array $data = []): bool
    {
        $user = $request->user();

        return match ($user->role) {
            UserRole::Admin => true,
            UserRole::Sender => $delivery->sender_id === $user->id && (
                $delivery->courier_id === null ||
                (
                    ($data['status'] ?? null) === Delivery::STATUS_CANCELLED &&
                    $delivery->status !== Delivery::STATUS_DELIVERED
                )
            ),
            UserRole::Courier => false,
        };
    }

    private function forbidden(): JsonResponse
    {
        return response()->json([
            'message' => 'Forbidden. You do not have permission to access this delivery.',
        ], Response::HTTP_FORBIDDEN);
    }
}
