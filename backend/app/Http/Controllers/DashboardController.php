<?php

namespace App\Http\Controllers;

use App\Http\Resources\BorrowingResource;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /** GET /api/dashboard - summary figures (different for admin and member). */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return $user->isAdmin() ? $this->adminSummary() : $this->memberSummary($user);
    }

    private function adminSummary(): JsonResponse
    {
        $byStatus = Borrowing::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')->pluck('total', 'status');

        $byCategory = Borrowing::join('books', 'books.id', '=', 'borrowings.book_id')
            ->join('categories', 'categories.id', '=', 'books.category_id')
            ->select('categories.name', DB::raw('count(*) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $recent = Borrowing::with(['book.author', 'user'])
            ->where('status', Borrowing::PENDING)
            ->latest('requested_at')->limit(5)->get();

        return response()->json(['data' => [
            'role' => 'admin',
            'stats' => [
                'total_books' => Book::count(),
                'total_copies' => (int) Book::sum('copies_total'),
                'total_members' => User::where('role', User::ROLE_MEMBER)->count(),
                'pending_requests' => $byStatus[Borrowing::PENDING] ?? 0,
                'active_loans' => $byStatus[Borrowing::APPROVED] ?? 0,
                'overdue_loans' => Borrowing::overdue()->count(),
                'returned_this_week' => Borrowing::where('status', Borrowing::RETURNED)
                    ->where('returned_at', '>=', now()->subDays(7))->count(),
            ],
            'charts' => [
                'by_status' => collect(['pending', 'approved', 'returned', 'rejected'])
                    ->map(fn ($s) => ['name' => $s, 'total' => (int) ($byStatus[$s] ?? 0)])->values(),
                'by_category' => $byCategory,
            ],
            'recent' => BorrowingResource::collection($recent),
        ]]);
    }

    private function memberSummary(User $user): JsonResponse
    {
        $mine = Borrowing::where('user_id', $user->id);

        $recent = Borrowing::with(['book.author', 'user'])
            ->where('user_id', $user->id)
            ->latest('requested_at')->latest('id')->limit(5)->get();

        return response()->json(['data' => [
            'role' => 'member',
            'stats' => [
                'pending_requests' => (clone $mine)->where('status', Borrowing::PENDING)->count(),
                'active_loans' => (clone $mine)->where('status', Borrowing::APPROVED)->count(),
                'overdue_loans' => (clone $mine)->overdue()->count(),
                'books_returned' => (clone $mine)->where('status', Borrowing::RETURNED)->count(),
            ],
            'charts' => null,
            'recent' => BorrowingResource::collection($recent),
        ]]);
    }
}
