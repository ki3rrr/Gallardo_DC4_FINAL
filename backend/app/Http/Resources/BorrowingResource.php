<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BorrowingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'is_overdue' => $this->is_overdue,
            'requested_at' => $this->requested_at?->toDateString(),
            'approved_at' => $this->approved_at?->toDateString(),
            'due_date' => $this->due_date?->toDateString(),
            'returned_at' => $this->returned_at?->toDateString(),
            'admin_note' => $this->admin_note,
            'user' => new UserResource($this->whenLoaded('user')),
            'book' => new BookResource($this->whenLoaded('book')),
        ];
    }
}
