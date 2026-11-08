<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AnnouncementType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->string('search')->trim()->toString();
        $typeParam = $request->string('type')->trim()->toString();
        $statusParam = $request->string('status')->trim()->toString();

        $typeEnum = $typeParam !== '' ? AnnouncementType::tryFromCaseInsensitive($typeParam) : null;

        $targetUsersCount = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->count();

        $query = Announcement::query()->with(['creator', 'reads']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        if ($typeEnum) {
            $query->where('type', $typeEnum->value);
        }

        if ($statusParam === 'published') {
            $query->where('is_published', true);
        } elseif ($statusParam === 'draft') {
            $query->where('is_published', false);
        }

        $announcements = $query->latest()->get()->map(fn (Announcement $a) => $this->formatAdmin($a, $targetUsersCount));

        $allAnnouncements = Announcement::all();

        $counts = [
            'total' => $allAnnouncements->count(),
            'published' => $allAnnouncements->where('is_published', true)->count(),
            'draft' => $allAnnouncements->where('is_published', false)->count(),
            'info' => $allAnnouncements->where('type', AnnouncementType::Info)->count(),
            'warning' => $allAnnouncements->where('type', AnnouncementType::Warning)->count(),
            'important' => $allAnnouncements->where('type', AnnouncementType::Important)->count(),
            'maintenance' => $allAnnouncements->where('type', AnnouncementType::Maintenance)->count(),
            'target_users_count' => $targetUsersCount,
        ];

        return response()->json([
            'data' => $announcements,
            'counts' => $counts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'message' => ['required', 'string', 'min:5'],
            'type' => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'publish' => ['nullable', 'boolean'],
        ]);

        $type = AnnouncementType::tryFromCaseInsensitive($validated['type']);
        if (! $type) {
            return response()->json([
                'message' => 'The selected type is invalid. Valid types are: Info, Warning, Important, Maintenance.',
                'errors' => ['type' => ['Invalid announcement type.']],
            ], 422);
        }

        $isPublished = $request->boolean('is_published') || $request->boolean('publish');

        $announcement = Announcement::create([
            'created_by' => $request->user()->id,
            'title' => trim($validated['title']),
            'message' => trim($validated['message']),
            'type' => $type,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        if ($isPublished) {
            $announcement->syncNotifications();
        }

        $targetUsersCount = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->count();

        return response()->json([
            'message' => $isPublished ? 'Announcement published successfully.' : 'Announcement draft saved successfully.',
            'data' => $this->formatAdmin($announcement->load('creator'), $targetUsersCount),
        ], 201);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        $announcement->load(['creator', 'reads.user']);

        $targetUsersCount = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->count();

        return response()->json([
            'data' => $this->formatAdmin($announcement, $targetUsersCount),
        ]);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'message' => ['sometimes', 'required', 'string', 'min:5'],
            'type' => ['sometimes', 'required', 'string'],
            'is_published' => ['nullable', 'boolean'],
            'publish' => ['nullable', 'boolean'],
        ]);

        $type = null;
        if (isset($validated['type'])) {
            $type = AnnouncementType::tryFromCaseInsensitive($validated['type']);
            if (! $type) {
                return response()->json([
                    'message' => 'The selected type is invalid. Valid types are: Info, Warning, Important, Maintenance.',
                    'errors' => ['type' => ['Invalid announcement type.']],
                ], 422);
            }
        }

        $wasPublished = $announcement->is_published;
        $willBePublished = $request->has('publish')
            ? $request->boolean('publish')
            : ($request->has('is_published') ? $request->boolean('is_published') : $wasPublished);

        $dataToUpdate = [];
        if (isset($validated['title'])) {
            $dataToUpdate['title'] = trim($validated['title']);
        }
        if (isset($validated['message'])) {
            $dataToUpdate['message'] = trim($validated['message']);
        }
        if ($type) {
            $dataToUpdate['type'] = $type;
        }

        if ($willBePublished !== $wasPublished) {
            $dataToUpdate['is_published'] = $willBePublished;
            if ($willBePublished) {
                $dataToUpdate['published_at'] = $announcement->published_at ?? now();
            }
        }

        $announcement->update($dataToUpdate);

        if ($willBePublished) {
            $announcement->syncNotifications();
        } elseif ($wasPublished && ! $willBePublished) {
            $announcement->cleanupNotifications();
        }

        $targetUsersCount = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->count();

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'data' => $this->formatAdmin($announcement->fresh(['creator', 'reads']), $targetUsersCount),
        ]);
    }

    public function publish(Announcement $announcement): JsonResponse
    {
        $announcement->publish();

        $targetUsersCount = User::whereIn('role', [UserRole::Sender->value, UserRole::Courier->value])
            ->where('status', '!=', 'suspended')
            ->count();

        return response()->json([
            'message' => 'Announcement published and broadcasted to all senders and couriers.',
            'data' => $this->formatAdmin($announcement->fresh(['creator', 'reads']), $targetUsersCount),
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->cleanupNotifications();
        $announcement->delete();

        return response()->json([
            'message' => 'Announcement deleted successfully.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatAdmin(Announcement $announcement, int $targetUsersCount): array
    {
        $readCount = $announcement->reads()->count();

        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'message' => $announcement->message,
            'type' => $announcement->type->value,
            'type_label' => $announcement->type->label(),
            'is_published' => $announcement->is_published,
            'status' => $announcement->is_published ? 'published' : 'draft',
            'published_at' => $announcement->published_at?->toIso8601String(),
            'created_at' => $announcement->created_at?->toIso8601String(),
            'updated_at' => $announcement->updated_at?->toIso8601String(),
            'read_count' => $readCount,
            'target_users_count' => $targetUsersCount,
            'creator' => $announcement->creator ? [
                'id' => $announcement->creator->id,
                'name' => $announcement->creator->name,
                'email' => $announcement->creator->email,
            ] : null,
        ];
    }
}
