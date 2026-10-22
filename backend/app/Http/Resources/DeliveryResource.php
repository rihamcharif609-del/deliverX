<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tracking_code' => $this->tracking_code,
            'sender_id' => $this->sender_id,
            'courier_id' => $this->courier_id,
            'pickup_address' => $this->pickup_address,
            'pickup_contact_name' => $this->pickup_contact_name,
            'pickup_contact_phone' => $this->pickup_contact_phone,
            'delivery_address' => $this->delivery_address,
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'package_description' => $this->package_description,
            'package_weight' => $this->package_weight,
            'delivery_date' => $this->delivery_date?->format('Y-m-d'),
            'delivery_time' => $this->delivery_time,
            'amount' => $this->amount,
            'commission' => $this->commission,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'delivery_otp' => $this->when(
                $request->user()?->role !== UserRole::Courier,
                $this->delivery_otp
            ),
            'payment_card_holder' => $this->payment_card_holder,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'payment' => $this->whenLoaded('payment', fn () => [
                'id' => $this->payment?->id,
                'transaction_reference' => $this->payment?->transaction_reference,
                'amount' => $this->payment?->amount,
                'commission' => $this->payment?->commission,
                'net_amount' => $this->payment?->net_amount,
                'status' => $this->payment?->status,
                'card_holder' => $this->payment?->card_holder,
                'paid_at' => $this->payment?->paid_at?->toIso8601String(),
                'released_at' => $this->payment?->released_at?->toIso8601String(),
                'refunded_at' => $this->payment?->refunded_at?->toIso8601String(),
            ]),
            'rating' => $this->whenLoaded('rating', fn () => $this->rating ? [
                'id' => $this->rating->id,
                'rating' => $this->rating->rating,
                'comment' => $this->rating->comment,
                'created_at' => $this->rating->created_at?->toIso8601String(),
            ] : null),
            'notes' => $this->notes,
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'picked_up_at' => $this->picked_up_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'sender' => new UserResource($this->whenLoaded('sender')),
            'courier' => new UserResource($this->whenLoaded('courier')),
        ];
    }
}
