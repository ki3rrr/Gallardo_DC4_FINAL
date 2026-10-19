<?php

namespace Tests\Feature;

use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MemberManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_search_create_read_update_and_delete_members(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create([
            'name' => 'Kier Test Member',
            'email' => 'kier.member@example.com',
        ]);
        User::factory()->admin()->create(['name' => 'Hidden Admin']);

        Sanctum::actingAs($admin);

        $this->getJson('/api/members?search=Kier')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'kier.member@example.com');

        $id = $this->postJson('/api/members', [
            'name' => 'New Library Member',
            'email' => 'new.member@example.com',
            'phone' => '09171234567',
            'password' => 'securepass123',
        ])->assertCreated()
            ->assertJsonPath('data.role', 'member')
            ->json('data.id');

        $this->assertDatabaseHas('users', ['id' => $id, 'role' => 'member']);
        $this->getJson("/api/members/{$id}")
            ->assertOk()
            ->assertJsonPath('data.email', 'new.member@example.com');

        $this->putJson("/api/members/{$id}", [
            'name' => 'Updated Library Member',
            'email' => 'updated.member@example.com',
            'phone' => null,
        ])->assertOk()->assertJsonPath('data.name', 'Updated Library Member');

        User::findOrFail($id)->createToken('member-session');
        $this->deleteJson("/api/members/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $id]);
        $this->assertDatabaseHas('users', ['id' => $member->id, 'role' => 'member']);
    }

    public function test_members_cannot_manage_member_records(): void
    {
        $member = User::factory()->create();
        Sanctum::actingAs($member);

        $this->getJson('/api/members')->assertForbidden();
        $this->postJson('/api/members', [])->assertForbidden();
        $this->putJson("/api/members/{$member->id}", [])->assertForbidden();
        $this->deleteJson("/api/members/{$member->id}")->assertForbidden();
    }

    public function test_admin_records_are_not_exposed_or_modifiable_as_members(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $otherAdmin = User::factory()->admin()->create();

        $this->getJson("/api/members/{$otherAdmin->id}")->assertNotFound();
        $this->putJson("/api/members/{$otherAdmin->id}", ['name' => 'Changed'])
            ->assertNotFound();
        $this->deleteJson("/api/members/{$otherAdmin->id}")->assertNotFound();
    }

    public function test_member_with_borrowing_history_cannot_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $member = User::factory()->create();
        Borrowing::factory()->create(['user_id' => $member->id]);

        Sanctum::actingAs($admin);

        $this->deleteJson("/api/members/{$member->id}")
            ->assertStatus(422)
            ->assertJsonPath('message', 'This member has borrowing history and cannot be deleted. Their library records are being preserved.');

        $this->assertDatabaseHas('users', ['id' => $member->id]);
    }

    public function test_member_creation_validates_password_and_email_uniqueness(): void
    {
        $admin = User::factory()->admin()->create();
        $existing = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->postJson('/api/members', [
            'name' => 'New Member',
            'email' => $existing->email,
            'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    }
}
