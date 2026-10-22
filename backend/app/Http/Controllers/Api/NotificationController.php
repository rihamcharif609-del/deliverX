<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::query()
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn (Notification $notification) => $this->format($notification));

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'target_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'target_role' => ['nullable', Rule::in(UserRole::values())],
            'title' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['required', 'string', 'max:80'],
            'path' => ['nullable', 'string', 'max:255'],
            'data' => ['nullable', 'array'],
        ]);

        $targetUsers = collect();

        if (! empty($data['target_user_id'])) {
            $targetUsers = User::whereKey($data['target_user_id'])->get();
        } elseif (! empty($data['target_role'])) {
            $targetUsers = User::where('role', $data['target_role'])->get();
        } else {
            $targetUsers = collect([$request->user()]);
        }

        $created = $targetUsers->map(fn (User $user) => Notification::create([
            'user_id' => $user->id,
            'title' => $data['title'] ?? null,
            'message' => $data['message'],
            'type' => $data['type'],
            'path' => $data['path'] ?? null,
            'data' => $data['data'] ?? null,
        ]));

        return response()->json([
            'data' => $created->map(fn (Notification $notification) => $this->format($notification)),
        ], 201);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'data' => $this->format($notification->refresh()),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function format(Notification $notification): array
    {
        return [
            'id' => $notification->id,
            'user_id' => $notification->user_id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'path' => $notification->path,
            'data' => $notification->data,
            'is_read' => $notification->is_read,
            'created_at' => $notification->created_at?->toIso8601String(),
            'updated_at' => $notification->updated_at?->toIso8601String(),
        ];
    }
}
