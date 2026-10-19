<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receives_member_role_and_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
            'role' => 'admin', // must be ignored
        ]);

        $response->assertCreated()->assertJsonPath('user.role', 'member')->assertJsonStructure(['token']);
    }

    public function test_register_validates_input(): void
    {
        $this->postJson('/api/register', [])->assertStatus(422)->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_login_with_valid_and_invalid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'a@example.com', 'password' => 'password']);

        $this->postJson('/api/login', ['email' => 'a@example.com', 'password' => 'password'])
            ->assertOk()->assertJsonStructure(['token', 'user']);

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'wrong'])
            ->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_require_a_token(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/books')->assertUnauthorized();
    }

    public function test_current_user_and_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $this->withToken($token)->getJson('/api/user')->assertOk()->assertJsonPath('data.email', $user->email);
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
