<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'DeliverX Admin',
                'email' => 'admin@deliverx.com',
                'password' => 'password',
                'role' => UserRole::Admin,
            ],
            [
                'name' => 'DeliverX Sender',
                'email' => 'sender@deliverx.com',
                'password' => 'password',
                'role' => UserRole::Sender,
            ],
            [
                'name' => 'Mike Smith',
                'email' => 'courier@deliverx.com',
                'password' => 'password',
                'role' => UserRole::Courier,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $data['password'],
                    'role' => $data['role'],
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
