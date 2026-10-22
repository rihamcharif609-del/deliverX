<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Delivery extends Model
{
    use HasFactory;

    public const STATUS_WAITING_COURIER = 'waiting-courier';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_PAID = 'paid';
    public const STATUS_PICKED_UP = 'picked-up';
    public const STATUS_IN_TRANSIT = 'in-transit';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'sender_id',
        'courier_id',
        'tracking_code',
        'pickup_address',
        'pickup_contact_name',
        'pickup_contact_phone',
        'delivery_address',
        'recipient_name',
        'recipient_phone',
        'package_description',
        'package_weight',
        'delivery_date',
        'delivery_time',
        'amount',
        'commission',
        'status',
        'payment_status',
        'delivery_otp',
        'payment_card_holder',
        'paid_at',
        'notes',
        'accepted_at',
        'picked_up_at',
        'delivered_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'package_weight' => 'decimal:2',
            'delivery_date' => 'date:Y-m-d',
            'amount' => 'decimal:2',
            'commission' => 'decimal:2',
            'paid_at' => 'datetime',
            'accepted_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Delivery $delivery) {
            if (! $delivery->tracking_code) {
                $delivery->tracking_code = self::makeTrackingCode();
            }
        });
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class);
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query
            ->whereNull('courier_id')
            ->where('status', self::STATUS_WAITING_COURIER);
    }

    private static function makeTrackingCode(): string
    {
        do {
            $code = 'DEL-' . now()->format('ymd') . '-' . strtoupper(str()->random(6));
        } while (self::where('tracking_code', $code)->exists());

        return $code;
    }
}
