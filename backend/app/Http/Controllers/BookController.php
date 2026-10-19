<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Borrowing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class BookController extends Controller
{
    /**
     * GET /api/books?search=&category_id=&available=1&page=&per_page=
     * Search matches title, ISBN or author name. Eager loads author + category (no N+1).
     */
    public function index(Request $request)
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 50);

        $books = Book::query()
            ->with(['author', 'category'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%")
                        ->orWhereHas('author', fn ($a) => $a->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->category_id, fn ($q, $id) => $q->where('category_id', $id))
            ->when($request->boolean('available'), fn ($q) => $q->where('copies_available', '>', 0))
            ->orderBy('title')
            ->paginate($perPage)
            ->withQueryString();

        return BookResource::collection($books);
    }

    public function store(StoreBookRequest $request): JsonResponse
    {
        $data = $request->safe()->except('cover');
        $data['copies_available'] = $data['copies_total'];

        if ($request->hasFile('cover')) {
            $data['cover_path'] = $request->file('cover')->store('covers', 'public');
        }

        $book = Book::create($data);

        return (new BookResource($book->load(['author', 'category'])))->response()->setStatusCode(201);
    }

    public function show(Book $book): BookResource
    {
        return new BookResource($book->load(['author', 'category']));
    }

    /** PUT /api/books/{id}  (with a cover file, send POST + _method=PUT as multipart) */
    public function update(UpdateBookRequest $request, Book $book): BookResource
    {
        $data = $request->safe()->except('cover');

        // Copies currently out on loan must still fit inside the new total.
        $onLoan = $book->copies_total - $book->copies_available;
        if ($data['copies_total'] < $onLoan) {
            throw ValidationException::withMessages([
                'copies_total' => ["{$onLoan} copies are currently on loan, so the total cannot be lower than that."],
            ]);
        }
        $data['copies_available'] = $data['copies_total'] - $onLoan;

        if ($request->hasFile('cover')) {
            if ($book->cover_path) {
                Storage::disk('public')->delete($book->cover_path);
            }
            $data['cover_path'] = $request->file('cover')->store('covers', 'public');
        }

        $book->update($data);

        return new BookResource($book->load(['author', 'category']));
    }

    public function destroy(Book $book): JsonResponse|Response
    {
        if ($book->borrowings()->where('status', Borrowing::APPROVED)->exists()) {
            return response()->json([
                'message' => 'This book is currently on loan and cannot be deleted.',
            ], 422);
        }

        if ($book->cover_path) {
            Storage::disk('public')->delete($book->cover_path);
        }

        $book->delete();

        return response()->noContent();
    }
}
