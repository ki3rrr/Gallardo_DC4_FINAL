<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Admin-only CRUD for library members. Admin accounts are deliberately
 * excluded from every query and cannot be changed through these endpoints.
 */
class MemberController extends Controller
{
    public function index(Request $request)
    {
        $members = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->withCount('borrowings')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return UserResource::collection($members);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $member = User::create([
            ...$validated,
            'role' => User::ROLE_MEMBER,
        ]);

        return (new UserResource($member))
            ->response()
            ->setStatusCode(201);
    }

    public function show(User $member): UserResource
    {
        $this->ensureMember($member);

        return new UserResource($member->loadCount('borrowings'));
    }

    public function update(Request $request, User $member): UserResource
    {
        $this->ensureMember($member);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($member->id),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'password' => ['sometimes', 'nullable', 'string', Password::min(8)],
        ]);

        // An empty optional password means "leave the current password alone".
        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $member->update($validated);

        return new UserResource($member->fresh()->loadCount('borrowings'));
    }

    public function destroy(User $member): Response|JsonResponse
    {
        $this->ensureMember($member);

        if ($member->borrowings()->exists()) {
            return response()->json([
                'message' => 'This member has borrowing history and cannot be deleted. Their library records are being preserved.',
            ], 422);
        }

        $member->tokens()->delete();
        $member->delete();

        return response()->noContent();
    }

    private function ensureMember(User $member): void
    {
        abort_unless($member->role === User::ROLE_MEMBER, 404);
    }
}
