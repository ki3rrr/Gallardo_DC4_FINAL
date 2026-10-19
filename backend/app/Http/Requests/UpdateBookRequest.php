<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateBookRequest extends StoreBookRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['isbn'] = ['required', 'string', 'max:20', Rule::unique('books', 'isbn')->ignore($this->route('book'))];

        return $rules;
    }
}
