<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'status' => $this->status,
            'is_suspended' => $this->isSuspended(),
            'suspended_at' => $this->suspended_at?->toIso8601String(),
            'suspended_until' => $this->suspended_until?->toIso8601String(),
            'suspension_reason' => $this->suspension_reason,
            'phone' => $this->phone,
            'address' => $this->address,
            'vehicle_type' => $this->vehicle_type,
            'vehicle_number' => $this->vehicle_number,
            'cin_number' => $this->cin_number,
            'driver_license' => $this->driver_license,
            'profile_photo' => $this->profile_photo,
            'verification_status' => $this->verification_status ?? 'draft',
            'cin_image' => $this->cin_image,
            'license_image' => $this->license_image,
            'vehicle_image' => $this->vehicle_image,
            'verification_submitted_at' => $this->verification_submitted_at?->toIso8601String(),
            'verification_reviewed_at' => $this->verification_reviewed_at?->toIso8601String(),
            'verification_rejection_reason' => $this->verification_rejection_reason,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
