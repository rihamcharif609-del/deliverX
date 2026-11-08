<?php

namespace Tests\Feature;

use App\Enums\AnnouncementType;
use App\Enums\UserRole;
use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAnnouncementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_draft_announcement(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin,
            'status' => 'active',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/announcements', [
                'title' => 'Scheduled Platform Upgrade',
                'message' => 'The system will undergo maintenance on Saturday at 2 AM.',
                'type' => 'Maintenance',
                'is_published' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Scheduled Platform Upgrade')
            ->assertJsonPath('data.type', 'maintenance')
            ->assertJsonPath('data.type_label', 'Maintenance')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.is_published', false);

        $this->assertDatabaseHas('announcements', [
            'title' => 'Scheduled Platform Upgrade',
            'type' => 'maintenance',
            'is_published' => false,
        ]);

        // Notifications should NOT be generated for drafts
        $this->assertEquals(0, Notification::where('type', 'announcement')->count());
    }

    public function test_admin_can_create_and_publish_announcement_immediately(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);
        $courier = User::factory()->create(['role' => UserRole::Courier, 'status' => 'active']);
        $otherAdmin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/announcements', [
                'title' => 'Severe Weather Delivery Notice',
                'message' => 'Expect slight delays in Casablanca due to heavy rain.',
                'type' => 'Warning',
                'publish' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.is_published', true);

        // Sender and courier should receive a notification
        $this->assertDatabaseHas('notifications', [
            'user_id' => $sender->id,
            'title' => 'Severe Weather Delivery Notice',
            'type' => 'announcement',
            'is_read' => false,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $courier->id,
            'title' => 'Severe Weather Delivery Notice',
            'type' => 'announcement',
            'is_read' => false,
        ]);

        // Admins should not receive user delivery announcement notifications
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $otherAdmin->id,
            'title' => 'Severe Weather Delivery Notice',
            'type' => 'announcement',
        ]);
    }

    public function test_admin_can_publish_draft_announcement(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Holiday Working Hours',
            'message' => 'DeliverX will operate standard hours during Eid.',
            'type' => AnnouncementType::Info,
            'is_published' => false,
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/admin/announcements/{$announcement->id}/publish");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_published', true);

        $announcement->refresh();
        $this->assertTrue($announcement->is_published);
        $this->assertNotNull($announcement->published_at);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sender->id,
            'title' => 'Holiday Working Hours',
            'type' => 'announcement',
        ]);
    }

    public function test_admin_can_edit_announcement(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Old Title',
            'message' => 'Old message text here.',
            'type' => AnnouncementType::Info,
            'is_published' => false,
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/admin/announcements/{$announcement->id}", [
                'title' => 'Updated New Title',
                'message' => 'Updated new message content.',
                'type' => 'Important',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated New Title')
            ->assertJsonPath('data.type', 'important');

        $announcement->refresh();
        $this->assertEquals('Updated New Title', $announcement->title);
        $this->assertEquals(AnnouncementType::Important, $announcement->type);
    }

    public function test_admin_can_delete_announcement_and_its_notifications(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'To be deleted',
            'message' => 'This announcement will be removed.',
            'type' => AnnouncementType::Warning,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $announcement->syncNotifications();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $sender->id,
            'title' => 'To be deleted',
        ]);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/v1/admin/announcements/{$announcement->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('announcements', ['id' => $announcement->id]);
        $this->assertDatabaseMissing('notifications', ['title' => 'To be deleted']);
    }

    public function test_invalid_type_returns_validation_error(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/announcements', [
                'title' => 'Test',
                'message' => 'Valid message',
                'type' => 'NonExistentType',
            ]);

        $response->assertStatus(422);
    }

    public function test_non_admin_cannot_manage_announcements(): void
    {
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);
        $token = $sender->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/announcements', [
                'title' => 'Unauthorized announcement',
                'message' => 'Should fail',
                'type' => 'Info',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_view_published_announcements_history_and_read_status(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);

        $published = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Published Notice',
            'message' => 'All senders can see this.',
            'type' => AnnouncementType::Info,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $draft = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Draft Notice',
            'message' => 'Senders should never see this.',
            'type' => AnnouncementType::Info,
            'is_published' => false,
        ]);

        $token = $sender->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/announcements');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $published->id)
            ->assertJsonPath('data.0.is_read', false)
            ->assertJsonPath('summary.total_published', 1)
            ->assertJsonPath('summary.unread_count', 1);
    }

    public function test_user_can_mark_announcement_as_read(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $sender = User::factory()->create(['role' => UserRole::Sender, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Notice to read',
            'message' => 'Please read this notice.',
            'type' => AnnouncementType::Important,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $announcement->syncNotifications();

        $token = $sender->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/v1/announcements/{$announcement->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $this->assertDatabaseHas('announcement_reads', [
            'announcement_id' => $announcement->id,
            'user_id' => $sender->id,
        ]);

        // Corresponding notification should also be marked as read
        $this->assertDatabaseHas('notifications', [
            'user_id' => $sender->id,
            'title' => 'Notice to read',
            'is_read' => true,
        ]);
    }

    public function test_marking_notification_as_read_synchronizes_announcement_read(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);
        $courier = User::factory()->create(['role' => UserRole::Courier, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Courier Road Safety',
            'message' => 'Drive carefully during rain.',
            'type' => AnnouncementType::Warning,
            'is_published' => true,
            'published_at' => now(),
        ]);
        $announcement->syncNotifications();

        $notification = Notification::where('user_id', $courier->id)
            ->where('type', 'announcement')
            ->first();

        $token = $courier->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_read', true);

        $this->assertDatabaseHas('announcement_reads', [
            'announcement_id' => $announcement->id,
            'user_id' => $courier->id,
        ]);
    }

    public function test_newly_registered_user_receives_published_announcements(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin, 'status' => 'active']);

        $announcement = Announcement::create([
            'created_by' => $admin->id,
            'title' => 'Welcome to DeliverX Platform',
            'message' => 'Getting started guidelines for all users.',
            'type' => AnnouncementType::Info,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Courier User',
            'email' => 'newcourier@example.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
            'role' => 'courier',
        ]);

        $response->assertStatus(201);
        $newUserId = $response->json('user.id');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $newUserId,
            'title' => 'Welcome to DeliverX Platform',
            'type' => 'announcement',
            'is_read' => false,
        ]);
    }
}
