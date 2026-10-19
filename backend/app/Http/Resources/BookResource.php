<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'isbn' => $this->isbn,
            'author_id' => $this->author_id,
            'category_id' => $this->category_id,
            'publisher' => $this->publisher,
            'published_year' => $this->published_year,
            'description' => $this->description,
            'copies_total' => $this->copies_total,
            'copies_available' => $this->copies_available,
            'is_available' => $this->copies_available > 0,
            'cover_url' => $this->cover_path ? Storage::disk('public')->url($this->cover_path) : null,
            'author' => new AuthorResource($this->whenLoaded('author')),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
