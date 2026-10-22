<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryResource;
use App\Http\Resources\UserResource;
use App\Models\Delivery;
use App\Models\Notification;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
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

        $search = $request->string('search')->trim()->toString();
        $role = $request->string('role')->trim()->toString();
        $status = $request->string('status')->trim()->toString();

        $users = User::query()
            ->whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->withCount(['sentDeliveries', 'courierDeliveries'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(
                in_array($role, [UserRole::Sender->value, UserRole::Courier->value], true),
                fn ($query) => $query->where('role', $role)
            )
            ->when(in_array($status, ['active', 'inactive', 'suspended'], true), fn ($query) => $query->where('status', $status))
            ->latest()
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
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'profile_photo' => $user->profile_photo,
                    'verification_status' => $user->verification_status ?? 'draft',
                    'joined' => $user->created_at?->format('Y-m-d'),
                    'deliveries' => $deliveries,
                ];
            });

        return response()->json([
            'data' => $users,
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->checkAndAutoReactivateSuspension();

        $user->loadCount([
            'sentDeliveries',
            'courierDeliveries',
            'ratingsGiven',
            'ratingsReceived',
        ])->loadAvg('ratingsReceived', 'rating');

        $deliveryQuery = Delivery::query()
            ->with(['sender', 'courier', 'payment', 'rating'])
            ->latest()
            ->limit(5);

        if ($user->role === UserRole::Sender) {
            $deliveryQuery->where('sender_id', $user->id);
        } elseif ($user->role === UserRole::Courier) {
            $deliveryQuery->where('courier_id', $user->id);
        } else {
            $deliveryQuery->whereRaw('1 = 0');
        }

        $recentDeliveries = $deliveryQuery->get();

        $reviews = Rating::query()
            ->with(['sender', 'courier', 'delivery'])
            ->when($user->role === UserRole::Courier, fn ($query) => $query->where('courier_id', $user->id))
            ->when($user->role === UserRole::Sender, fn ($query) => $query->where('sender_id', $user->id))
            ->when($user->role === UserRole::Admin, fn ($query) => $query->whereRaw('1 = 0'))
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Rating $rating) => RatingController::formatRating($rating));

        $totalDeliveries = match ($user->role) {
            UserRole::Sender => $user->sent_deliveries_count,
            UserRole::Courier => $user->courier_deliveries_count,
            UserRole::Admin => 0,
        };

        $completedDeliveries = match ($user->role) {
            UserRole::Sender => $user->sentDeliveries()->where('status', Delivery::STATUS_DELIVERED)->count(),
            UserRole::Courier => $user->courierDeliveries()->where('status', Delivery::STATUS_DELIVERED)->count(),
            UserRole::Admin => 0,
        };

        $totalSpent = $user->role === UserRole::Sender
            ? (float) $user->sentDeliveries()->sum('amount')
            : 0.0;

        $totalEarned = $user->role === UserRole::Courier
            ? (float) $user->courierPayments()->where('status', 'released')->sum('net_amount')
            : 0.0;

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'stats' => [
                    'total_deliveries' => $totalDeliveries,
                    'completed_deliveries' => $completedDeliveries,
                    'ratings_given' => $user->ratings_given_count,
                    'reviews_count' => $user->ratings_received_count,
                    'average_rating' => round((float) ($user->ratings_received_avg_rating ?? 0), 1),
                    'total_spent' => $totalSpent,
                    'total_earned' => $totalEarned,
                ],
                'recent_deliveries' => DeliveryResource::collection($recentDeliveries),
                'reviews' => $reviews,
            ],
        ]);
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        if ($user->role === UserRole::Admin) {
            return response()->json([
                'message' => 'Administrators cannot be suspended.',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:1000'],
            'duration' => ['required', 'string', 'in:24h,7d,30d,indefinite'],
        ]);

        $user->suspend($validated['reason'], $validated['duration']);

        $durationLabel = match ($validated['duration']) {
            '24h' => 'for 24 hours',
            '7d' => 'for 7 days',
            '30d' => 'for 30 days',
            default => 'indefinitely',
        };

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Account Suspended',
            'message' => "Your account has been suspended {$durationLabel}. Reason: {$user->suspension_reason}",
            'type' => 'account_suspended',
            'path' => '/login',
            'data' => [
                'reason' => $user->suspension_reason,
                'duration' => $validated['duration'],
                'suspended_until' => $user->suspended_until?->toIso8601String(),
            ],
        ]);

        return response()->json([
            'message' => "User {$user->name} has been suspended {$durationLabel}.",
            'data' => new UserResource($user->refresh()),
        ]);
    }

    public function unsuspend(User $user): JsonResponse
    {
        if ($user->role === UserRole::Admin) {
            return response()->json([
                'message' => 'Administrators cannot be modified with this action.',
            ], 403);
        }

        $user->unsuspend();

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Account Reactivated',
            'message' => 'Your account suspension has been lifted. You can now access your account and all DeliverX features.',
            'type' => 'account_unsuspended',
            'path' => '/',
            'data' => [],
        ]);

        return response()->json([
            'message' => "User {$user->name}'s suspension has been lifted and account is now active.",
            'data' => new UserResource($user->refresh()),
        ]);
    }
}
