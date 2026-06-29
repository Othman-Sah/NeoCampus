<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScaffoldTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test login validation error.
     */
    public function test_login_validation_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/auth/login', []);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    /**
     * Test successful login.
     */
    public function test_successful_login_returns_token_and_user(): void
    {
        $etablissement = Etablissement::create([
            'nom' => 'Test GS',
            'code' => 'TEST_GS',
        ]);

        $user = User::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'token',
                     'token_type',
                     'user' => [
                         'id',
                         'etablissement_id',
                         'nom',
                         'prenom',
                         'email',
                         'role',
                     ]
                 ]);
    }

    /**
     * Test protected routes require authentication.
     */
    public function test_protected_routes_require_authentication(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(401);
    }

    /**
     * Test me endpoint returns profile.
     */
    public function test_me_endpoint_returns_profile_for_authenticated_user(): void
    {
        $etablissement = Etablissement::create([
            'nom' => 'Test GS',
            'code' => 'TEST_GS',
        ]);

        $user = User::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Doe',
            'prenom' => 'John',
            'email' => 'john@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        $response = $this->actingAs($user)
                         ->getJson('/api/auth/me');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => [
                         'id',
                         'nom',
                         'prenom',
                         'email',
                         'role',
                     ]
                 ]);
    }

    /**
     * Test role-based access middleware.
     */
    public function test_role_middleware_restricts_access(): void
    {
        $etablissement = Etablissement::create([
            'nom' => 'Test GS',
            'code' => 'TEST_GS',
        ]);

        // Create a student user
        $student = User::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Doe',
            'prenom' => 'Jane',
            'email' => 'jane@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        // Access student-specific endpoint -> should succeed
        $response = $this->actingAs($student)
                         ->getJson('/api/student/dashboard');

        $response->assertStatus(200);

        // Access admin-specific endpoint -> should be forbidden (403)
        $response = $this->actingAs($student)
                         ->getJson('/api/admin/eleves');

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Forbidden: You do not have the required role.']);
    }
}
