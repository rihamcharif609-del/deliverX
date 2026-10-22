<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CourierProfileController extends Controller
{
    public function show(Request $request): UserResource|JsonResponse
    {
        if ($request->user()->role !== UserRole::Courier) {
            return $this->forbidden();
        }

        return new UserResource($request->user());
    }

    public function update(Request $request): UserResource|JsonResponse
    {
        $user = $request->user();

        if ($user->role !== UserRole::Courier) {
            return $this->forbidden();
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'vehicle_type' => ['nullable', 'string', 'max:100'],
            'vehicle_number' => ['nullable', 'string', 'max:100'],
            'cin_number' => ['nullable', 'string', 'max:100'],
            'driver_license' => ['nullable', 'string', 'max:100'],
            'profile_photo' => ['nullable', 'string'],
        ]);

        $user->update([
            ...$data,
            'verification_status' => $user->verification_status === 'approved'
                ? 'approved'
                : 'draft',
            'verification_rejection_reason' => null,
        ]);

        return new UserResource($user->refresh());
    }

    public function document(Request $request, string $document): UserResource|JsonResponse
    {
        $user = $request->user();

        if ($user->role !== UserRole::Courier) {
            return $this->forbidden();
        }

        $column = $this->documentColumn($document);
        if (! $column) {
            return response()->json(['message' => 'Unknown document type.'], 404);
        }

        $data = $request->validate([
            'fileName' => ['required', 'string', 'max:255'],
            'dataUrl' => ['required', 'string'],
            'uploadedAt' => ['nullable', 'date'],
        ]);

        $user->update([
            $column => [
                'fileName' => $data['fileName'],
                'dataUrl' => $data['dataUrl'],
                'uploadedAt' => $data['uploadedAt'] ?? now()->toIso8601String(),
            ],
            'verification_status' => $user->verification_status === 'approved'
                ? 'approved'
                : 'draft',
            'verification_rejection_reason' => null,
        ]);

        return new UserResource($user->refresh());
    }

    public function submit(Request $request): UserResource|JsonResponse
    {
        $user = $request->user();

        if ($user->role !== UserRole::Courier) {
            return $this->forbidden();
        }

        if (! $this->profileComplete($user)) {
            return response()->json([
                'message' => 'Complete your profile and upload all required documents first.',
            ], 422);
        }

        $user->update([
            'verification_status' => 'pending',
            'verification_submitted_at' => now(),
            'verification_reviewed_at' => null,
            'verification_rejection_reason' => null,
        ]);

        return new UserResource($user->refresh());
    }

    public function adminIndex(): JsonResponse
    {
        $couriers = User::query()
            ->where('role', UserRole::Courier->value)
            ->whereIn('verification_status', ['pending', 'approved', 'rejected'])
            ->latest('verification_submitted_at')
            ->get();

        return response()->json([
            'data' => UserResource::collection($couriers),
        ]);
    }

    public function adminDecision(Request $request, User $courier): UserResource|JsonResponse
    {
        if ($courier->role !== UserRole::Courier) {
            return response()->json(['message' => 'Selected user is not a courier.'], 422);
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(['approved', 'rejected'])],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $courier->update([
            'verification_status' => $data['status'],
            'verification_reviewed_at' => now(),
            'verification_rejection_reason' => $data['status'] === 'rejected'
                ? ($data['reason'] ?? 'Documents do not meet requirements.')
                : null,
        ]);

        return new UserResource($courier->refresh());
    }

    private function profileComplete(User $user): bool
    {
        return collect([
            $user->name,
            $user->email,
            $user->phone,
            $user->address,
            $user->vehicle_type,
            $user->vehicle_number,
            $user->cin_number,
            $user->driver_license,
            $user->cin_image['dataUrl'] ?? null,
            $user->license_image['dataUrl'] ?? null,
            $user->vehicle_image['dataUrl'] ?? null,
        ])->every(fn ($value) => filled($value));
    }

    private function documentColumn(string $document): ?string
    {
        return [
            'cinImage' => 'cin_image',
            'licenseImage' => 'license_image',
            'vehicleImage' => 'vehicle_image',
        ][$document] ?? null;
    }

    private function forbidden(): JsonResponse
    {
        return response()->json([
            'message' => 'Forbidden. You do not have permission to access courier profiles.',
        ], 403);
    }
}
