<?php

namespace Tests\Feature\Library\TenantIsolation;

use App\Models\Adherent;
use App\Models\Etablissement;
use App\Models\Livre;
use App\Models\Emprunt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Etablissement $tenantA;
    private Etablissement $tenantB;
    
    private User $userA;
    private User $userB;
    
    private User $studentB;
    private Adherent $adherentB;
    
    private Livre $bookA;
    private Livre $bookB;
    
    private Emprunt $loanB;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create Tenant A
        $this->tenantA = Etablissement::create(['nom' => 'Tenant A', 'code' => 'TA']);
        $this->userA = User::create([
            'email' => 'admin@tenantA.com',
            'nom' => 'User',
            'prenom' => 'A',
            'role' => 'bibliothecaire',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->tenantA->id,
        ]);
        $this->bookA = Livre::create([
            'titre' => 'Book of Tenant A',
            'auteur' => 'Author A',
            'isbn' => '1111111111111',
            'quantite_stock' => 5,
            'etablissement_id' => $this->tenantA->id,
        ]);

        // 2. Create Tenant B
        $this->tenantB = Etablissement::create(['nom' => 'Tenant B', 'code' => 'TB']);
        $this->userB = User::create([
            'email' => 'admin@tenantB.com',
            'nom' => 'User',
            'prenom' => 'B',
            'role' => 'bibliothecaire',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->tenantB->id,
        ]);
        $this->bookB = Livre::create([
            'titre' => 'Book of Tenant B',
            'auteur' => 'Author B',
            'isbn' => '2222222222222',
            'quantite_stock' => 5,
            'etablissement_id' => $this->tenantB->id,
        ]);

        $this->studentB = User::create([
            'email' => 'student@tenantB.com',
            'nom' => 'Student',
            'prenom' => 'B',
            'role' => 'eleve',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->tenantB->id,
        ]);

        $this->adherentB = Adherent::create([
            'user_id' => $this->studentB->id,
            'user_type' => \App\Models\Eleve::class,
            'etablissement_id' => $this->tenantB->id,
        ]);

        $this->loanB = Emprunt::create([
            'livre_id' => $this->bookB->id,
            'adherent_id' => $this->adherentB->id,
            'date_emprunt' => now()->subDays(10)->toDateString(),
            'date_retour_prevue' => now()->subDays(2)->toDateString(), // Overdue
            'statut' => 'en_cours',
            'etablissement_id' => $this->tenantB->id,
        ]);

        // Seed settings for both tenants
        foreach ([$this->tenantA, $this->tenantB] as $tenant) {
            DB::table('library_settings')->insert([
                [
                    'etablissement_id' => $tenant->id,
                    'key' => 'max_loans_per_member',
                    'value' => json_encode(5),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'etablissement_id' => $tenant->id,
                    'key' => 'loan_duration_days',
                    'value' => json_encode(14),
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'etablissement_id' => $tenant->id,
                    'key' => 'fine_per_day_mad',
                    'value' => json_encode(2),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }

        // Authenticate as Tenant A
        Sanctum::actingAs($this->userA);
    }

    public function test_tenant_a_cannot_read_tenant_b_books(): void
    {
        $response = $this->getJson('/api/v1/library/books?q=Tenant B');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_tenant_a_cannot_update_tenant_b_book(): void
    {
        $response = $this->putJson("/api/v1/library/books/{$this->bookB->id}", [
            'titre' => 'Hacked Title',
        ]);

        $response->assertStatus(404);
        $this->assertDatabaseHas('livres', [
            'id' => $this->bookB->id,
            'titre' => 'Book of Tenant B',
        ]);
    }

    public function test_tenant_a_cannot_delete_tenant_b_book(): void
    {
        $response = $this->deleteJson("/api/v1/library/books/{$this->bookB->id}");

        $response->assertStatus(404);
        $this->assertNull($this->bookB->fresh()->deleted_at);
    }

    public function test_tenant_a_cannot_create_loan_referencing_tenant_b_book(): void
    {
        $response = $this->postJson('/api/v1/library/loans', [
            'livre_id' => $this->bookB->id,
            'adherent_id' => $this->adherentB->id,
        ]);

        $response->assertStatus(422); // Validation fails because exists check fails on tenant A
    }

    public function test_tenant_a_cannot_return_tenant_b_loan(): void
    {
        $response = $this->putJson("/api/v1/library/loans/{$this->loanB->id}/return");

        $response->assertStatus(403);
        $this->assertEquals('en_cours', $this->loanB->fresh()->statut);
    }

    public function test_tenant_a_cannot_list_tenant_b_overdue_loans(): void
    {
        $response = $this->getJson('/api/v1/library/overdue');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_tenant_a_stats_does_not_contain_tenant_b_metrics(): void
    {
        $response = $this->getJson('/api/v1/library/stats');

        $response->assertStatus(200)
            ->assertJson([
                'total_books' => 5, // Tenant A's bookA quantity stock
                'active_loans' => 0, // Tenant A has 0 active loans (Tenant B's active loan should not count)
                'overdue_loans' => 0,
            ]);
    }
}
