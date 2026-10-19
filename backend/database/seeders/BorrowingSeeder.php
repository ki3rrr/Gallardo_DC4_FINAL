<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Database\Seeder;

/** 30 borrowing records across every status, keeping book copy counts consistent. */
class BorrowingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $members = User::where('role', User::ROLE_MEMBER)->orderBy('id')->get();
        $books = Book::orderBy('id')->get();

        $cycle = ['pending', 'approved', 'returned', 'returned', 'approved', 'rejected', 'returned'];

        for ($i = 0; $i < 30; $i++) {
            $member = $members[$i % $members->count()];
            $book = $books[($i * 7 + 3) % $books->count()];
            $status = $cycle[$i % count($cycle)];

            if ($status === 'approved' && $book->copies_available < 1) {
                $status = 'returned';
            }

            $record = ['user_id' => $member->id, 'book_id' => $book->id, 'status' => $status];

            switch ($status) {
                case 'pending':
                    $record['requested_at'] = now()->subDays($i % 4)->subHours(2);
                    break;

                case 'approved':
                    // every other active loan is already overdue
                    $daysAgo = $i % 2 === 0 ? 20 : 5;
                    $record['requested_at'] = now()->subDays($daysAgo + 1);
                    $record['approved_at'] = now()->subDays($daysAgo);
                    $record['due_date'] = now()->subDays($daysAgo)->addDays(14)->toDateString();
                    $record['processed_by'] = $admin->id;
                    $book->decrement('copies_available');
                    break;

                case 'returned':
                    $requested = 15 + ($i % 20);
                    $record['requested_at'] = now()->subDays($requested + 1);
                    $record['approved_at'] = now()->subDays($requested);
                    $record['due_date'] = now()->subDays($requested)->addDays(14)->toDateString();
                    $record['returned_at'] = now()->subDays(max(1, $requested - 9));
                    $record['processed_by'] = $admin->id;
                    break;

                case 'rejected':
                    $record['requested_at'] = now()->subDays(6);
                    $record['admin_note'] = 'Reference copy only. Please read it at the library front desk.';
                    $record['processed_by'] = $admin->id;
                    break;
            }

            Borrowing::create($record);
        }
    }
}
