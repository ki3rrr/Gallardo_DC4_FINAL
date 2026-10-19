<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuthorRequest;
use App\Http\Resources\AuthorResource;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthorController extends Controller
{
    /** GET /api/authors?search=&page=   (use ?all=1 for dropdowns, no pagination) */
    public function index(Request $request)
    {
        $query = Author::query()
            ->withCount('books')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name');

        return AuthorResource::collection(
            $request->boolean('all') ? $query->get() : $query->paginate(10)->withQueryString()
        );
    }

    public function store(AuthorRequest $request): JsonResponse
    {
        $author = Author::create($request->validated());

        return (new AuthorResource($author))->response()->setStatusCode(201);
    }

    public function show(Author $author): AuthorResource
    {
        return new AuthorResource($author->loadCount('books'));
    }

    public function update(AuthorRequest $request, Author $author): AuthorResource
    {
        $author->update($request->validated());

        return new AuthorResource($author->loadCount('books'));
    }

    public function destroy(Author $author): JsonResponse|Response
    {
        if ($author->books()->exists()) {
            return response()->json([
                'message' => 'This author still has books. Delete or reassign those books first.',
            ], 422);
        }

        $author->delete();

        return response()->noContent();
    }
}
