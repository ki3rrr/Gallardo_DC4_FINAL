<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BorrowingWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_workflow_request_approve_return(): void
    {
        $member = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $book = Book::factory()->create(['copies_total' => 1, 'copies_available' => 1]);

        // 1. member requests
        Sanctum::actingAs($member);
        $id = $this->postJson('/api/borrowings', ['book_id' => $book->id])
            ->assertCreated()->assertJsonPath('data.status', 'pending')->json('data.id');

        // member cannot approve their own request
        $this->patchJson("/api/borrowings/{$id}/status", ['status' => 'approved'])->assertForbidden();

        // 2. admin approves -> copy is taken
        Sanctum::actingAs($admin);
        $this->patchJson("/api/borrowings/{$id}/status", ['status' => 'approved'])
            ->assertOk()->assertJsonPath('data.status', 'approved');
        $this->assertSame(0, $book->fresh()->copies_available);

        // cannot jump back to rejected
        $this->patchJson("/api/borrowings/{$id}/status", ['status' => 'rejected'])->assertStatus(422);

        // 3. admin marks returned -> copy is back
        $this->patchJson("/api/borrowings/{$id}/status", ['status' => 'returned'])
            ->assertOk()->assertJsonPath('data.status', 'returned');
        $this->assertSame(1, $book->fresh()->copies_available);
    }

    public function test_cannot_request_unavailable_or_duplicate_book(): void
    {
        $member = User::factory()->create();
        Sanctum::actingAs($member);

        $none = Book::factory()->create(['copies_total' => 1, 'copies_available' => 0]);
        $this->postJson('/api/borrowings', ['book_id' => $none->id])->assertStatus(422);

        $book = Book::factory()->create();
        $this->postJson('/api/borrowings', ['book_id' => $book->id])->assertCreated();
        $this->postJson('/api/borrowings', ['book_id' => $book->id])->assertStatus(422);
    }

    public function test_members_only_see_their_own_borrowings(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        Borrowing::factory()->count(2)->create(['user_id' => $a->id]);
        $theirs = Borrowing::factory()->create(['user_id' => $b->id]);

        Sanctum::actingAs($a);
        $this->getJson('/api/borrowings')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson("/api/borrowings/{$theirs->id}")->assertForbidden();
    }

    public function test_dashboard_returns_summary_figures(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/dashboard')->assertOk()
            ->assertJsonStructure(['data' => ['stats' => ['total_books', 'total_members', 'pending_requests', 'active_loans', 'overdue_loans']]]);
    }
}
