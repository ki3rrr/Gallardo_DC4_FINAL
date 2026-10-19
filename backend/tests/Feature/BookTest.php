<?php

namespace Tests\Feature;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $override = []): array
    {
        return array_merge([
            'title' => 'Clean Code',
            'isbn' => '9780132350884',
            'author_id' => Author::factory()->create()->id,
            'category_id' => Category::factory()->create()->id,
            'copies_total' => 3,
        ], $override);
    }

    public function test_member_can_list_books_with_pagination_and_search(): void
    {
        Sanctum::actingAs(User::factory()->create());
        Book::factory()->count(12)->create();
        Book::factory()->create(['title' => 'Unique Searchable Title']);

        $this->getJson('/api/books')->assertOk()->assertJsonCount(8, 'data')->assertJsonStructure(['data', 'links', 'meta']);
        $this->getJson('/api/books?per_page=50')->assertOk()->assertJsonCount(13, 'data');
        $this->getJson('/api/books?search=Searchable')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_member_cannot_create_update_or_delete_books(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $book = Book::factory()->create();

        $this->postJson('/api/books', $this->payload())->assertForbidden();
        $this->putJson("/api/books/{$book->id}", $this->payload())->assertForbidden();
        $this->deleteJson("/api/books/{$book->id}")->assertForbidden();
    }

    public function test_admin_can_crud_a_book(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $id = $this->postJson('/api/books', $this->payload())->assertCreated()->json('data.id');

        $this->putJson("/api/books/{$id}", $this->payload(['title' => 'Clean Code 2nd Ed.', 'copies_total' => 5]))
            ->assertOk()->assertJsonPath('data.title', 'Clean Code 2nd Ed.')->assertJsonPath('data.copies_available', 5);

        $this->deleteJson("/api/books/{$id}")->assertNoContent();
        $this->getJson("/api/books/{$id}")->assertNotFound();
    }

    public function test_book_validation_errors_return_422(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/books', [])->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'isbn', 'author_id', 'category_id', 'copies_total']);
    }
}
