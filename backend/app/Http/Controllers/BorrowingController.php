<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBorrowingRequest;
use App\Http\Requests\UpdateBorrowingStatusRequest;
use App\Http\Resources\BorrowingResource;
use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class BorrowingController extends Controller
{
    private const MAX_ACTIVE_PER_MEMBER = 3;

    /**
     * GET /api/borrowings?status=&search=&overdue=1&page=
     * Admin: every record.  Member: only their own.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $borrowings = Borrowing::query()
            ->with(['book.author', 'user'])
            ->when(! $user->isAdmin(), fn ($q) => $q->where('user_id', $user->id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->boolean('overdue'), fn ($q) => $q->overdue())
            ->when($request->search, function ($q, $search) use ($user) {
                $q->where(function ($q) use ($search, $user) {
                    $q->whereHas('book', fn ($b) => $b->where('title', 'like', "%{$search}%"));
                    if ($user->isAdmin()) {
                        $q->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
                    }
                });
            })
            ->latest('requested_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return BorrowingResource::collection($borrowings);
    }

    /** POST /api/borrowings - a user requests a book (status = pending). */
    public function store(StoreBorrowingRequest $request): JsonResponse
    {
        $user = $request->user();
        $book = Book::findOrFail($request->book_id);

        if ($book->copies_available < 1) {
            throw ValidationException::withMessages(['book_id' => ['No copies of this book are available right now.']]);
        }

        $active = Borrowing::where('user_id', $user->id)
            ->whereIn('status', [Borrowing::PENDING, Borrowing::APPROVED]);

        if ((clone $active)->where('book_id', $book->id)->exists()) {
            throw ValidationException::withMessages(['book_id' => ['You already have an open request or loan for this book.']]);
        }

        if ((clone $active)->count() >= self::MAX_ACTIVE_PER_MEMBER) {
            throw ValidationException::withMessages(['book_id' => ['You can have at most ' . self::MAX_ACTIVE_PER_MEMBER . ' open requests/loans at a time.']]);
        }

        $borrowing = Borrowing::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'status' => Borrowing::PENDING,
            'requested_at' => now(),
        ]);

        return (new BorrowingResource($borrowing->load(['book.author', 'user'])))
            ->response()->setStatusCode(201);
    }

    public function show(Borrowing $borrowing): BorrowingResource
    {
        Gate::authorize('view', $borrowing);

        return new BorrowingResource($borrowing->load(['book.author', 'user']));
    }

    /**
     * PATCH /api/borrowings/{id}/status   (admin only, route middleware)
     * Workflow:  pending -> approved | rejected      approved -> returned
     */
    public function updateStatus(UpdateBorrowingStatusRequest $request, Borrowing $borrowing): BorrowingResource
    {
        $new = $request->status;

        $allowed = [
            Borrowing::PENDING => [Borrowing::APPROVED, Borrowing::REJECTED],
            Borrowing::APPROVED => [Borrowing::RETURNED],
        ];

        if (! in_array($new, $allowed[$borrowing->status] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => ["A {$borrowing->status} record cannot be changed to {$new}."],
            ]);
        }

        DB::transaction(function () use ($request, $borrowing, $new) {
            $book = Book::whereKey($borrowing->book_id)->lockForUpdate()->first();

            if ($new === Borrowing::APPROVED) {
                if ($book->copies_available < 1) {
                    throw ValidationException::withMessages(['status' => ['No copies are available to lend.']]);
                }
                $book->decrement('copies_available');
                $borrowing->approved_at = now();
                $borrowing->due_date = now()->addDays((int) ($request->input('loan_days') ?: 14))->toDateString();
            }

            if ($new === Borrowing::RETURNED) {
                $book->update(['copies_available' => min($book->copies_total, $book->copies_available + 1)]);
                $borrowing->returned_at = now();
            }

            $borrowing->status = $new;
            $borrowing->admin_note = $request->admin_note ?? $borrowing->admin_note;
            $borrowing->processed_by = $request->user()->id;
            $borrowing->save();
        });

        return new BorrowingResource($borrowing->fresh(['book.author', 'user']));
    }

    /** DELETE /api/borrowings/{id} - member cancels own pending request; admin deletes a record. */
    public function destroy(Borrowing $borrowing): JsonResponse|Response
    {
        Gate::authorize('delete', $borrowing);

        if ($borrowing->status === Borrowing::APPROVED) {
            return response()->json(['message' => 'Mark the book as returned before deleting this record.'], 422);
        }

        $borrowing->delete();

        return response()->noContent();
    }
}
