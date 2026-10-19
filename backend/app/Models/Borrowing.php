<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Borrowing extends Model
{
    use HasFactory;

    public const PENDING = 'pending';
    public const APPROVED = 'approved';
    public const RETURNED = 'returned';
    public const REJECTED = 'rejected';

    protected $fillable = [
        'user_id', 'book_id', 'status', 'requested_at', 'approved_at',
        'due_date', 'returned_at', 'admin_note', 'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'returned_at' => 'datetime',
            'due_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /** An approved loan whose due date has passed. */
    public function getIsOverdueAttribute(): bool
    {
        return $this->status === self::APPROVED
            && $this->due_date !== null
            && $this->due_date->copy()->endOfDay()->isPast();
    }

    /** Scope: approved loans past their due date. */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::APPROVED)->whereDate('due_date', '<', now()->toDateString());
    }
}
