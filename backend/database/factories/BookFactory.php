<?php

namespace Database\Factories;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Book> */
class BookFactory extends Factory
{
    protected $model = Book::class;

    public function definition(): array
    {
        $copies = fake()->numberBetween(1, 5);

        return [
            'title' => fake()->unique()->sentence(3),
            'isbn' => fake()->unique()->isbn13(),
            'author_id' => Author::factory(),
            'category_id' => Category::factory(),
            'publisher' => fake()->company(),
            'published_year' => fake()->numberBetween(1950, (int) date('Y')),
            'description' => fake()->paragraph(),
            'copies_total' => $copies,
            'copies_available' => $copies,
        ];
    }
}
