<?php

namespace App\Policies;

use App\Models\Borrowing;
use App\Models\User;

class BorrowingPolicy
{
    /** Admins see everything; members only see their own records. */
    public function view(User $user, Borrowing $borrowing): bool
    {
        return $user->isAdmin() || $borrowing->user_id === $user->id;
    }

    /** Admins may delete any record; members may only cancel their own pending request. */
    public function delete(User $user, Borrowing $borrowing): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $borrowing->user_id === $user->id && $borrowing->status === Borrowing::PENDING;
    }
}
