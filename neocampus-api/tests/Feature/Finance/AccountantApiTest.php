<?php

namespace Tests\Feature\Finance;

use App\Models\User;
use App\Models\Etablissement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountantApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Etablissement $etablissement;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissement = Etablissement::create([
            'nom' => 'Test GS',
            'code' => 'TGS'
        ]);

        $this->admin = User::create([
            'email' => 'admin@test.com',
            'nom' => 'Admin',
            'prenom' => 'Test',
            'role' => 'admin',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        Sanctum::actingAs($this->admin);
    }

    public function test_can_list_accountants(): void
    {
        User::create([
            'email' => 'comptable1@test.com',
            'nom' => 'C1',
            'prenom' => 'Test',
            'role' => 'comptable',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $response = $this->getJson('/api/admin/accountants');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'comptable1@test.com');
    }

    public function test_can_create_accountant(): void
    {
        $response = $this->postJson('/api/admin/accountants', [
            'nom' => 'Smith',
            'prenom' => 'John',
            'email' => 'smith@test.com',
            'password' => 'password123'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'smith@test.com');

        $this->assertDatabaseHas('users', [
            'email' => 'smith@test.com',
            'role' => 'comptable'
        ]);
    }

    public function test_can_update_accountant(): void
    {
        $comptable = User::create([
            'email' => 'comptable@test.com',
            'nom' => 'C1',
            'prenom' => 'Test',
            'role' => 'comptable',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $response = $this->putJson("/api/admin/accountants/{$comptable->id}", [
            'nom' => 'Smith Updated'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.nom', 'Smith Updated');

        $this->assertDatabaseHas('users', [
            'id' => $comptable->id,
            'nom' => 'Smith Updated'
        ]);
    }

    public function test_can_delete_accountant(): void
    {
        $comptable = User::create([
            'email' => 'comptable@test.com',
            'nom' => 'C1',
            'prenom' => 'Test',
            'role' => 'comptable',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $response = $this->deleteJson("/api/admin/accountants/{$comptable->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', [
            'id' => $comptable->id
        ]);
    }
}
