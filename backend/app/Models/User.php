<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'phone',
        'address',
        'vehicle_type',
        'vehicle_number',
        'cin_number',
        'driver_license',
        'profile_photo',
        'verification_status',
        'cin_image',
        'license_image',
        'vehicle_image',
        'verification_submitted_at',
        'verification_reviewed_at',
        'verification_rejection_reason',
        'suspended_at',
        'suspended_until',
        'suspension_reason',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'cin_image' => 'array',
            'license_image' => 'array',
            'vehicle_image' => 'array',
            'verification_submitted_at' => 'datetime',
            'verification_reviewed_at' => 'datetime',
            'suspended_at' => 'datetime',
            'suspended_until' => 'datetime',
        ];
    }

    public function isSuspended(): bool
    {
        $this->checkAndAutoReactivateSuspension();

        return $this->status === 'suspended';
    }

    public function checkAndAutoReactivateSuspension(): bool
    {
        if ($this->status === 'suspended') {
            if ($this->suspended_until !== null && now()->greaterThanOrEqualTo($this->suspended_until)) {
                $this->status = 'active';
                $this->suspended_at = null;
                $this->suspended_until = null;
                $this->suspension_reason = null;
                $this->save();

                return true;
            }
        }

        return false;
    }

    public function suspend(string $reason, ?string $duration): void
    {
        $suspendedUntil = match ($duration) {
            '24h' => now()->addHours(24),
            '7d' => now()->addDays(7),
            '30d' => now()->addDays(30),
            default => null,
        };

        $this->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspended_until' => $suspendedUntil,
            'suspension_reason' => $reason,
        ]);

        $this->tokens()->delete();
    }

    public function unsuspend(): void
    {
        $this->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspended_until' => null,
            'suspension_reason' => null,
        ]);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isSender(): bool
    {
        return $this->role === UserRole::Sender;
    }

    public function isCourier(): bool
    {
        return $this->role === UserRole::Courier;
    }

    public function sentDeliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'sender_id');
    }

    public function courierDeliveries(): HasMany
    {
        return $this->hasMany(Delivery::class, 'courier_id');
    }

    public function sentPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'sender_id');
    }

    public function courierPayments(): HasMany
    {
        return $this->hasMany(Payment::class, 'courier_id');
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class, 'courier_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function ratingsGiven(): HasMany
    {
        return $this->hasMany(Rating::class, 'sender_id');
    }

    public function ratingsReceived(): HasMany
    {
        return $this->hasMany(Rating::class, 'courier_id');
    }
}
