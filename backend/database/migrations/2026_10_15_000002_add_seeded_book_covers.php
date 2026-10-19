<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $coverIds = [
        'To Kill a Mockingbird' => 14351077,
        '1984' => 10541663,
        'Pride and Prejudice' => 14348537,
        'The Great Gatsby' => 10590366,
        'One Hundred Years of Solitude' => 15185412,
        'Noli Me Tangere' => 5738053,
        'El Filibusterismo' => 1054329,
        'A Brief History of Time' => 10432365,
        'Cosmos' => 8283901,
        'The Selfish Gene' => 133936,
        'Clean Code' => 8065615,
        'The Pragmatic Programmer' => 10143650,
        'Introduction to Algorithms' => 2341462,
        'Eloquent JavaScript' => 7082166,
        'Sapiens' => 8634250,
        'Guns, Germs, and Steel' => 7884018,
        'The Diary of a Young Girl' => 13526331,
        'Atomic Habits' => 12539702,
        'The 7 Habits of Highly Effective People' => 10079937,
        'Rich Dad Poor Dad' => 8315603,
        "Harry Potter and the Philosopher's Stone" => 15155833,
        'The Little Prince' => 10708272,
        "Charlotte's Web" => 8461797,
        'And Then There Were None' => 11172296,
        'The Hound of the Baskervilles' => 8063264,
    ];

    public function up(): void
    {
        foreach ($this->coverIds as $title => $coverId) {
            DB::table('books')
                ->where('title', $title)
                ->whereNull('cover_path')
                ->update(['cover_path' => "covers/seeded/{$coverId}.jpg"]);
        }
    }

    public function down(): void
    {
        foreach ($this->coverIds as $title => $coverId) {
            DB::table('books')
                ->where('title', $title)
                ->where('cover_path', "covers/seeded/{$coverId}.jpg")
                ->update(['cover_path' => null]);
        }
    }
};
