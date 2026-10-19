<?php

namespace App\Http\Requests;

use App\Models\Borrowing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBorrowingStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([Borrowing::APPROVED, Borrowing::REJECTED, Borrowing::RETURNED])],
            'admin_note' => ['nullable', 'string', 'max:255'],
            'loan_days' => ['nullable', 'integer', 'min:1', 'max:60'],
        ];
    }
}
