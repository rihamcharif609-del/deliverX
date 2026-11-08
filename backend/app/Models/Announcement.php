<?php

namespace App\Models;

use App\Enums\AnnouncementType;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Announcement extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'created_by',
        'title',
        'message',
        'type',
        'is_published',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AnnouncementType::class,
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(AnnouncementRead::class);
    }

    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'announcement_reads')
            ->withPivot('read_at')
            ->withTimestamps();
    }

    public function publish(): void
    {
        $this->update([
            'is_published' => true,
            'published_at' => $this->published_at ?? now(),
        ]);

        $this->syncNotifications();
    }

    public function syncNotifications(): void
    {
        if (! $this->is_published) {
            return;
        }

        $users = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->get();

        $notificationData = [
            'announcement_id' => $this->id,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'published_at' => $this->published_at?->toIso8601String(),
        ];

        foreach ($users as $user) {
            $path = $user->role === UserRole::Courier ? '/courier/announcements' : '/sender/announcements';

            $existingNotification = Notification::where('user_id', $user->id)
                ->where('type', 'announcement')
                ->whereJsonContains('data->announcement_id', $this->id)
                ->first();

            if ($existingNotification) {
                $existingNotification->update([
                    'title' => $this->title,
                    'message' => $this->message,
                    'path' => $path,
                    'data' => $notificationData,
                ]);
            } else {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $this->title,
                    'message' => $this->message,
                    'type' => 'announcement',
                    'path' => $path,
                    'data' => $notificationData,
                    'is_read' => false,
                ]);
            }
        }
    }

    public function cleanupNotifications(): void
    {
        Notification::where('type', 'announcement')
            ->whereJsonContains('data->announcement_id', $this->id)
            ->delete();
    }

    public function isReadBy(User $user): bool
    {
        $hasReadRecord = $this->reads()->where('user_id', $user->id)->exists();
        if ($hasReadRecord) {
            return true;
        }

        return Notification::where('user_id', $user->id)
            ->where('type', 'announcement')
            ->where('is_read', true)
            ->whereJsonContains('data->announcement_id', $this->id)
            ->exists();
    }

    public function markAsReadFor(User $user): void
    {
        AnnouncementRead::firstOrCreate(
            [
                'announcement_id' => $this->id,
                'user_id' => $user->id,
            ],
            [
                'read_at' => now(),
            ]
        );

        Notification::where('user_id', $user->id)
            ->where('type', 'announcement')
            ->whereJsonContains('data->announcement_id', $this->id)
            ->update(['is_read' => true]);
    }
}
