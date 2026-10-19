<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('authors', 'name')->ignore($this->route('author'))],
            'nationality' => ['nullable', 'string', 'max:80'],
            'bio' => ['nullable', 'string', 'max:3000'],
        ];
    }
}
