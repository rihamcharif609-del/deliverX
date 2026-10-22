<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    public const STATUS_HELD = 'held';
    public const STATUS_RELEASED = 'released';
    public const STATUS_REFUNDED = 'refunded';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'delivery_id',
        'sender_id',
        'courier_id',
        'transaction_reference',
        'amount',
        'commission',
        'net_amount',
        'status',
        'card_holder',
        'paid_at',
        'released_at',
        'refunded_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'commission' => 'decimal:2',
            'net_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'released_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    public static function makeReference(): string
    {
        do {
            $reference = 'PAY-' . now()->format('ymd') . '-' . strtoupper(str()->random(8));
        } while (self::where('transaction_reference', $reference)->exists());

        return $reference;
    }
}
