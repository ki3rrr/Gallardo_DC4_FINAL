<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'isbn' => ['required', 'string', 'max:20', 'unique:books,isbn'],
            'author_id' => ['required', 'integer', 'exists:authors,id'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'publisher' => ['nullable', 'string', 'max:255'],
            'published_year' => ['nullable', 'integer', 'min:1000', 'max:' . (date('Y') + 1)],
            'description' => ['nullable', 'string', 'max:5000'],
            'copies_total' => ['required', 'integer', 'min:1', 'max:1000'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'isbn.unique' => 'A book with this ISBN already exists.',
            'author_id.required' => 'Please choose an author.',
            'category_id.required' => 'Please choose a category.',
            'cover.max' => 'The cover image must not be larger than 2 MB.',
        ];
    }
}
