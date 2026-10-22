<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class RatingController extends Controller
{
    public function store(Request $request, Delivery $delivery): JsonResponse
    {
        if ($delivery->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only rate your own deliveries.'], Response::HTTP_FORBIDDEN);
        }

        if ($delivery->status !== Delivery::STATUS_DELIVERED || ! $delivery->courier_id) {
            return response()->json(['message' => 'Only delivered orders can be rated.'], Response::HTTP_CONFLICT);
        }

        if ($delivery->rating()->exists()) {
            return response()->json(['message' => 'This delivery has already been rated.'], Response::HTTP_CONFLICT);
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $rating = Rating::create([
            'delivery_id' => $delivery->id,
            'sender_id' => $request->user()->id,
            'courier_id' => $delivery->courier_id,
            'rating' => $data['rating'],
            'comment' => $data['comment'] ?? null,
            'created_at' => now(),
        ]);

        return response()->json([
            'data' => $this->formatRating($rating->load(['sender', 'courier', 'delivery'])),
        ], Response::HTTP_CREATED);
    }

    public function courierRatings(Request $request, ?User $courier = null): JsonResponse
    {
        $targetCourier = $courier ?? $request->user();

        if (! $targetCourier->isCourier()) {
            return response()->json(['message' => 'Selected user is not a courier.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'data' => $this->courierRatingSummary($targetCourier),
        ]);
    }

    public static function courierRatingSummary(User $courier): array
    {
        $baseQuery = Rating::where('courier_id', $courier->id);
        $average = (float) (clone $baseQuery)->avg('rating');
        $count = (clone $baseQuery)->count();

        $latest = (clone $baseQuery)
            ->with(['sender', 'delivery'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Rating $rating) => self::formatRating($rating));

        return [
            'courier_id' => $courier->id,
            'courier_name' => $courier->name,
            'average_rating' => round($average, 1),
            'reviews_count' => $count,
            'latest_comments' => $latest,
        ];
    }

    public static function adminRatingSummary(int $limit = 5): array
    {
        $couriers = User::query()
            ->where('role', 'courier')
            ->withCount('ratingsReceived')
            ->withAvg('ratingsReceived', 'rating')
            ->get()
            ->map(fn (User $courier) => [
                'courier_id' => $courier->id,
                'courier_name' => $courier->name,
                'average_rating' => round((float) ($courier->ratings_received_avg_rating ?? 0), 1),
                'reviews_count' => $courier->ratings_received_count,
            ])
            ->filter(fn (array $courier) => $courier['reviews_count'] > 0)
            ->values();

        $topRated = $couriers
            ->sortByDesc(fn (array $courier) => [$courier['average_rating'], $courier['reviews_count']])
            ->take($limit)
            ->values();

        $worstRated = $couriers
            ->sortBy(fn (array $courier) => [$courier['average_rating'], -$courier['reviews_count']])
            ->take($limit)
            ->values();

        $latestReviews = Rating::with(['sender', 'courier', 'delivery'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Rating $rating) => self::formatRating($rating));

        return [
            'top_rated_couriers' => $topRated,
            'worst_rated_couriers' => $worstRated,
            'latest_reviews' => $latestReviews,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function formatRating(Rating $rating): array
    {
        return [
            'id' => $rating->id,
            'delivery_id' => $rating->delivery_id,
            'delivery_code' => $rating->delivery?->tracking_code,
            'sender_id' => $rating->sender_id,
            'sender_name' => $rating->sender?->name,
            'courier_id' => $rating->courier_id,
            'courier_name' => $rating->courier?->name,
            'rating' => $rating->rating,
            'comment' => $rating->comment,
            'created_at' => $rating->created_at?->toIso8601String(),
        ];
    }
}
