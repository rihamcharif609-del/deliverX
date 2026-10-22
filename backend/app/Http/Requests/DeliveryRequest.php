<?php

namespace App\Http\Requests;

use App\Models\Delivery;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $requiredForCreate = Rule::requiredIf($this->isMethod('post'));

        return [
            'courier_id' => ['sometimes', 'nullable', Rule::exists('users', 'id')->where('role', UserRole::Courier->value)],
            'pickup_address' => [$requiredForCreate, 'string', 'max:255'],
            'pickup_contact_name' => ['nullable', 'string', 'max:255'],
            'pickup_contact_phone' => ['nullable', 'string', 'max:30'],
            'delivery_address' => [$requiredForCreate, 'string', 'max:255'],
            'recipient_name' => [$requiredForCreate, 'string', 'max:255'],
            'recipient_phone' => [$requiredForCreate, 'string', 'max:30'],
            'package_description' => ['nullable', 'string'],
            'package_weight' => ['nullable', 'numeric', 'min:0'],
            'delivery_date' => ['nullable', 'date'],
            'delivery_time' => ['nullable', 'string', 'max:30'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'commission' => ['nullable', 'numeric', 'min:0'],
            'status' => [
                'sometimes',
                Rule::in([
                    Delivery::STATUS_WAITING_COURIER,
                    Delivery::STATUS_ACCEPTED,
                    Delivery::STATUS_PAID,
                    Delivery::STATUS_PICKED_UP,
                    Delivery::STATUS_IN_TRANSIT,
                    Delivery::STATUS_DELIVERED,
                    Delivery::STATUS_CANCELLED,
                ]),
            ],
            'payment_status' => ['sometimes', Rule::in(['unpaid', 'held', 'released', 'refunded'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
