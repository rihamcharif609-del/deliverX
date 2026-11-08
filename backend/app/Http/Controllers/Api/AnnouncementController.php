<?php

namespace App\Http\Controllers\Api;

use App\Enums\AnnouncementType;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $search = $request->string('search')->trim()->toString();
        $typeParam = $request->string('type')->trim()->toString();
        $typeEnum = $typeParam !== '' ? AnnouncementType::tryFromCaseInsensitive($typeParam) : null;

        $userReadIds = AnnouncementRead::where('user_id', $user->id)
            ->pluck('read_at', 'announcement_id');

        $query = Announcement::query()
            ->where('is_published', true)
            ->with('creator')
            ->latest('published_at');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($typeEnum) {
            $query->where('type', $typeEnum->value);
        }

        $allPublished = Announcement::where('is_published', true)->get();
        $unreadCount = $allPublished->filter(fn (Announcement $a) => ! isset($userReadIds[$a->id]))->count();

        $announcements = $query->get()->map(function (Announcement $announcement) use ($userReadIds) {
            $isRead = isset($userReadIds[$announcement->id]);
            $readAt = $isRead ? $userReadIds[$announcement->id] : null;

            return [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'message' => $announcement->message,
                'type' => $announcement->type->value,
                'type_label' => $announcement->type->label(),
                'published_at' => $announcement->published_at?->toIso8601String(),
                'created_at' => $announcement->created_at?->toIso8601String(),
                'is_read' => $isRead,
                'read_at' => $readAt ? (is_string($readAt) ? $readAt : $readAt->toIso8601String()) : null,
                'creator' => $announcement->creator ? [
                    'name' => $announcement->creator->name,
                ] : null,
            ];
        });

        // Find latest unread announcement for quick banner alerts
        $latestUnread = $allPublished
            ->filter(fn (Announcement $a) => ! isset($userReadIds[$a->id]))
            ->sortByDesc('published_at')
            ->first();

        return response()->json([
            'data' => $announcements,
            'summary' => [
                'total_published' => $allPublished->count(),
                'unread_count' => $unreadCount,
                'latest_unread' => $latestUnread ? [
                    'id' => $latestUnread->id,
                    'title' => $latestUnread->title,
                    'type' => $latestUnread->type->value,
                    'type_label' => $latestUnread->type->label(),
                    'message' => $latestUnread->message,
                    'published_at' => $latestUnread->published_at?->toIso8601String(),
                ] : null,
            ],
        ]);
    }

    public function markRead(Request $request, Announcement $announcement): JsonResponse
    {
        if (! $announcement->is_published) {
            return response()->json(['message' => 'Announcement not found.'], 404);
        }

        $user = $request->user();
        $announcement->markAsReadFor($user);

        return response()->json([
            'message' => 'Announcement marked as read.',
            'data' => [
                'id' => $announcement->id,
                'is_read' => true,
                'read_at' => now()->toIso8601String(),
            ],
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $published = Announcement::where('is_published', true)->get();

        foreach ($published as $announcement) {
            AnnouncementRead::firstOrCreate(
                [
                    'announcement_id' => $announcement->id,
                    'user_id' => $user->id,
                ],
                [
                    'read_at' => now(),
                ]
            );
        }

        Notification::where('user_id', $user->id)
            ->where('type', 'announcement')
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'All announcements marked as read.',
        ]);
    }
}
