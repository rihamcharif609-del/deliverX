<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSuspendUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_suspend_sender_with_duration_and_reason(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $sender = User::factory()->create([
            'role' => UserRole::Sender,
            'status' => 'active',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/users/{$sender->id}/suspend", [
                'reason' => 'Violation of terms of service',
                'duration' => '24h',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'suspended')
            ->assertJsonPath('data.suspension_reason', 'Violation of terms of service');

        $sender->refresh();
        $this->assertEquals('suspended', $sender->status);
        $this->assertEquals('Violation of terms of service', $sender->suspension_reason);
        $this->assertNotNull($sender->suspended_until);
        $this->assertTrue($sender->suspended_until->isFuture());
    }

    public function test_admin_can_suspend_courier_indefinitely(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $courier = User::factory()->create([
            'role' => UserRole::Courier,
            'status' => 'active',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/users/{$courier->id}/suspend", [
                'reason' => 'Suspicious fraudulent delivery activity',
                'duration' => 'indefinite',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'suspended')
            ->assertJsonPath('data.suspension_reason', 'Suspicious fraudulent delivery activity');

        $courier->refresh();
        $this->assertEquals('suspended', $courier->status);
        $this->assertNull($courier->suspended_until);
    }

    public function test_admin_cannot_suspend_another_admin(): void
    {
        $admin1 = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $admin2 = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $token = $admin1->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/users/{$admin2->id}/suspend", [
                'reason' => 'Test reason',
                'duration' => '24h',
            ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Administrators cannot be suspended.');
    }

    public function test_non_admin_cannot_suspend_users(): void
    {
        $sender = User::factory()->create([
            'role' => UserRole::Sender,
            'status' => 'active',
        ]);

        $otherUser = User::factory()->create([
            'role' => UserRole::Courier,
            'status' => 'active',
        ]);

        $token = $sender->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/users/{$otherUser->id}/suspend", [
                'reason' => 'Unauthorized attempt',
                'duration' => '24h',
            ]);

        $response->assertStatus(403);
    }

    public function test_suspended_user_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Sender,
            'password' => bcrypt('password123'),
            'status' => 'suspended',
            'suspended_until' => now()->addDays(7),
            'suspension_reason' => 'Late delivery complaints',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('account_suspended', true)
            ->assertJsonPath('suspension_reason', 'Late delivery complaints');
    }

    public function test_suspended_user_existing_tokens_revoked_and_cannot_access_protected_features(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Sender,
            'status' => 'active',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        // Suspend user
        $user->suspend('Terms violation', '7d');

        // Verify tokens were revoked
        $this->assertCount(0, $user->tokens);

        // Attempting to access protected endpoint with old token fails with 401 Unauthenticated
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(401);

        // Even if user somehow had a token assigned while status was suspended:
        $freshToken = $user->createToken('direct-token')->plainTextToken;

        $response2 = $this->withHeader('Authorization', "Bearer {$freshToken}")
            ->getJson('/api/v1/sender/deliveries');

        $response2->assertStatus(403)
            ->assertJsonPath('account_suspended', true);
    }

    public function test_admin_can_unsuspend_user(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $user = User::factory()->create([
            'role' => UserRole::Sender,
            'status' => 'suspended',
            'suspended_at' => now()->subDay(),
            'suspended_until' => now()->addDays(6),
            'suspension_reason' => 'Temporary suspension',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/users/{$user->id}/unsuspend");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'active');

        $user->refresh();
        $this->assertEquals('active', $user->status);
        $this->assertNull($user->suspended_at);
        $this->assertNull($user->suspended_until);
        $this->assertNull($user->suspension_reason);
    }

    public function test_expired_suspension_automatically_reactivates_on_login(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Sender,
            'password' => bcrypt('password123'),
            'status' => 'suspended',
            'suspended_at' => now()->subDays(2),
            'suspended_until' => now()->subHour(), // Expired 1 hour ago
            'suspension_reason' => '24h temporary cooldown',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);

        $user->refresh();
        $this->assertEquals('active', $user->status);
        $this->assertNull($user->suspended_until);
        $this->assertNull($user->suspension_reason);
    }

    public function test_artisan_command_reactivates_expired_suspensions(): void
    {
        $expiredUser = User::factory()->create([
            'role' => UserRole::Courier,
            'status' => 'suspended',
            'suspended_at' => now()->subDays(8),
            'suspended_until' => now()->subDay(), // Expired yesterday
            'suspension_reason' => '7d suspension',
        ]);

        $activeSuspendedUser = User::factory()->create([
            'role' => UserRole::Sender,
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspended_until' => now()->addDays(5), // Still active for 5 days
            'suspension_reason' => 'Active suspension',
        ]);

        $this->artisan('users:reactivate-suspended')
            ->expectsOutput('Reactivated 1 expired user suspension(s).')
            ->assertSuccessful();

        $expiredUser->refresh();
        $activeSuspendedUser->refresh();

        $this->assertEquals('active', $expiredUser->status);
        $this->assertEquals('suspended', $activeSuspendedUser->status);
    }
}
