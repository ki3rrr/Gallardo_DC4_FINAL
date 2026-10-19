<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

/** Seeds categories, authors and 25 real-sounding books. */
class LibrarySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Fiction' => 'Novels and short stories from around the world.',
            'Philippine Literature' => 'Classic and contemporary works from Filipino authors.',
            'Science' => 'Popular science, nature and the universe.',
            'Technology' => 'Programming, algorithms and software craftsmanship.',
            'History' => 'People, societies and events that shaped the world.',
            'Self-Help & Business' => 'Personal growth, habits, money and leadership.',
            'Children & Young Adult' => 'Stories for young readers.',
            'Mystery & Detective' => 'Whodunits, crime and suspense.',
        ];

        $cat = [];
        foreach ($categories as $name => $description) {
            $cat[$name] = Category::create(['name' => $name, 'description' => $description])->id;
        }

        // title, author, nationality, category, year, publisher, copies, description
        $rows = [
            ['To Kill a Mockingbird', 'Harper Lee', 'American', 'Fiction', 1960, 'J. B. Lippincott & Co.', 3, 'A young girl in Alabama watches her father defend a Black man falsely accused of a crime.'],
            ['1984', 'George Orwell', 'British', 'Fiction', 1949, 'Secker & Warburg', 4, 'A chilling vision of a totalitarian state that watches and rewrites everything.'],
            ['Pride and Prejudice', 'Jane Austen', 'British', 'Fiction', 1813, 'T. Egerton', 3, 'Elizabeth Bennet and Mr. Darcy navigate manners, money and misjudgement.'],
            ['The Great Gatsby', 'F. Scott Fitzgerald', 'American', 'Fiction', 1925, "Charles Scribner's Sons", 2, 'A portrait of ambition and excess in the Jazz Age.'],
            ['One Hundred Years of Solitude', 'Gabriel García Márquez', 'Colombian', 'Fiction', 1967, 'Harper & Row', 2, 'Seven generations of the Buendía family in the mythical town of Macondo.'],
            ['Noli Me Tangere', 'José Rizal', 'Filipino', 'Philippine Literature', 1887, 'Berliner Buchdruckerei-Aktiengesellschaft', 5, 'Crisostomo Ibarra returns home and uncovers the abuses of colonial society.'],
            ['El Filibusterismo', 'José Rizal', 'Filipino', 'Philippine Literature', 1891, 'F. Meyer-van Loo', 4, 'The sequel to Noli Me Tangere, where reform turns into revenge.'],
            ['A Brief History of Time', 'Stephen Hawking', 'British', 'Science', 1988, 'Bantam Books', 3, 'From the Big Bang to black holes, explained for general readers.'],
            ['Cosmos', 'Carl Sagan', 'American', 'Science', 1980, 'Random House', 2, 'A personal voyage through the universe and our place in it.'],
            ['The Selfish Gene', 'Richard Dawkins', 'British', 'Science', 1976, 'Oxford University Press', 2, 'A gene-centred view of evolution.'],
            ['Clean Code', 'Robert C. Martin', 'American', 'Technology', 2008, 'Prentice Hall', 4, 'A handbook of agile software craftsmanship.'],
            ['The Pragmatic Programmer', 'Andrew Hunt', 'American', 'Technology', 1999, 'Addison-Wesley', 3, 'Practical advice for becoming a better, more effective developer.'],
            ['Introduction to Algorithms', 'Thomas H. Cormen', 'American', 'Technology', 1990, 'MIT Press', 2, 'The standard university textbook on algorithms and data structures.'],
            ['Eloquent JavaScript', 'Marijn Haverbeke', 'Dutch', 'Technology', 2011, 'No Starch Press', 3, 'A modern introduction to programming with JavaScript.'],
            ['Sapiens', 'Yuval Noah Harari', 'Israeli', 'History', 2011, 'Harper', 4, 'A brief history of humankind from the Stone Age to today.'],
            ['Guns, Germs, and Steel', 'Jared Diamond', 'American', 'History', 1997, 'W. W. Norton', 2, 'Why some societies came to dominate others.'],
            ['The Diary of a Young Girl', 'Anne Frank', 'German-Dutch', 'History', 1947, 'Contact Publishing', 3, 'The wartime diary of a girl hiding in Amsterdam.'],
            ['Atomic Habits', 'James Clear', 'American', 'Self-Help & Business', 2018, 'Avery', 5, 'Tiny changes that lead to remarkable results.'],
            ['The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'American', 'Self-Help & Business', 1989, 'Free Press', 3, 'Principles for personal and professional effectiveness.'],
            ['Rich Dad Poor Dad', 'Robert Kiyosaki', 'American', 'Self-Help & Business', 1997, 'Warner Books', 3, 'Lessons about money from two very different father figures.'],
            ["Harry Potter and the Philosopher's Stone", 'J. K. Rowling', 'British', 'Children & Young Adult', 1997, 'Bloomsbury', 5, 'An orphaned boy discovers he is a wizard.'],
            ['The Little Prince', 'Antoine de Saint-Exupéry', 'French', 'Children & Young Adult', 1943, 'Reynal & Hitchcock', 3, 'A pilot meets a young prince who has travelled from a tiny planet.'],
            ["Charlotte's Web", 'E. B. White', 'American', 'Children & Young Adult', 1952, 'Harper & Brothers', 3, 'A pig, a spider and a barnyard friendship.'],
            ['And Then There Were None', 'Agatha Christie', 'British', 'Mystery & Detective', 1939, 'Collins Crime Club', 3, 'Ten strangers on an island, and a killer among them.'],
            ['The Hound of the Baskervilles', 'Arthur Conan Doyle', 'British', 'Mystery & Detective', 1902, 'George Newnes', 2, 'Sherlock Holmes investigates a legendary spectral hound.'],
        ];

        // Local Open Library cover thumbnails shipped with this project.
        $coverIds = [
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

        $authors = [];
        foreach ($rows as $n => [$title, $authorName, $nationality, $category, $year, $publisher, $copies, $description]) {
            $authors[$authorName] ??= Author::create([
                'name' => $authorName,
                'nationality' => $nationality,
                'bio' => "{$authorName} is a {$nationality} author best known for \"{$title}\".",
            ])->id;

            Book::create([
                'title' => $title,
                'isbn' => $this->isbn13(9780000000000 + ($n + 1) * 7919),
                'author_id' => $authors[$authorName],
                'category_id' => $cat[$category],
                'publisher' => $publisher,
                'published_year' => $year,
                'description' => $description,
                'copies_total' => $copies,
                'copies_available' => $copies,
                'cover_path' => isset($coverIds[$title]) ? "covers/seeded/{$coverIds[$title]}.jpg" : null,
            ]);
        }
    }

    /** Replace the last digit with a valid ISBN-13 check digit. */
    private function isbn13(int $seed): string
    {
        $digits = substr((string) $seed, 0, 12);
        $sum = 0;
        foreach (str_split($digits) as $i => $d) {
            $sum += (int) $d * ($i % 2 === 0 ? 1 : 3);
        }

        return $digits . ((10 - ($sum % 10)) % 10);
    }
}
