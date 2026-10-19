<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    /** GET /api/categories?search=&page=   (use ?all=1 for dropdowns, no pagination) */
    public function index(Request $request)
    {
        $query = Category::query()
            ->withCount('books')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderBy('name');

        return CategoryResource::collection(
            $request->boolean('all') ? $query->get() : $query->paginate(10)->withQueryString()
        );
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        return new CategoryResource($category->loadCount('books'));
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category->update($request->validated());

        return new CategoryResource($category->loadCount('books'));
    }

    public function destroy(Category $category): JsonResponse|Response
    {
        if ($category->books()->exists()) {
            return response()->json([
                'message' => 'This category still has books. Delete or reassign those books first.',
            ], 422);
        }

        $category->delete();

        return response()->noContent();
    }
}
