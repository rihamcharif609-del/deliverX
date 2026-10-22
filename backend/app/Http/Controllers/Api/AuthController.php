<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $role = UserRole::from($request->string('role')->toString());

        $user = User::create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'role' => $role,
            'status' => 'active',
            'verification_status' => $role === UserRole::Courier ? 'draft' : 'approved',
        ]);

        User::where('role', UserRole::Admin->value)->get()->each(function (User $admin) use ($user, $role) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New user registered',
                'message' => "{$user->name} registered as a {$role->value}.",
                'type' => 'user_registered',
                'path' => '/admin/users',
                'data' => [
                    'details' => [
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $role->value,
                        'dateJoined' => $user->created_at?->format('Y-m-d'),
                    ],
                    'targetRole' => UserRole::Admin->value,
                ],
            ]);
        });

        $token = $user->createToken($request->input('device_name', 'deliverx-web'))->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->toString())->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->checkAndAutoReactivateSuspension();

        if ($user->isSuspended()) {
            $durationText = $user->suspended_until
                ? "until {$user->suspended_until->format('Y-m-d H:i:s')} UTC"
                : 'indefinitely';

            return response()->json([
                'message' => "This account has been suspended {$durationText}. Reason: {$user->suspension_reason}",
                'account_suspended' => true,
                'suspension_reason' => $user->suspension_reason,
                'suspended_until' => $user->suspended_until?->toIso8601String(),
            ], 403);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['This account is inactive.'],
            ]);
        }

        $token = $user->createToken($request->input('device_name', 'deliverx-web'))->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => new UserResource($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'profile_photo' => ['nullable', 'string'],
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user->refresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
