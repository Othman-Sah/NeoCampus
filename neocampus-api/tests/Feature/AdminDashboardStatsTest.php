<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\AnneeScolaire;
use App\Models\Section;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    private Etablissement $etablissementA;
    private Etablissement $etablissementB;
    private User $adminA;
    private User $adminB;
    private User $studentA;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create two isolated tenants
        $this->etablissementA = Etablissement::create([
            'nom' => 'GS Etablissement A',
            'code' => 'ETAB_A',
        ]);

        $this->etablissementB = Etablissement::create([
            'nom' => 'GS Etablissement B',
            'code' => 'ETAB_B',
        ]);

        // 2. Create users under Etablissement A
        $this->adminA = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Admin',
            'prenom' => 'A',
            'email' => 'adminA@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->studentA = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Student',
            'prenom' => 'A',
            'email' => 'studentA@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        // 3. Create users under Etablissement B
        $this->adminB = User::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'Admin',
            'prenom' => 'B',
            'email' => 'adminB@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);
    }

    /**
     * Test statistics endpoint requires authentication.
     */
    public function test_stats_endpoints_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/admin/stats/overview');
        $response->assertStatus(401);
    }

    /**
     * Test statistics endpoint restricts non-admin roles.
     */
    public function test_stats_endpoints_restrict_non_admin_roles(): void
    {
        $response = $this->actingAs($this->studentA)
            ->getJson('/api/v1/admin/stats/overview');

        $response->assertStatus(403)
            ->assertJson(['message' => 'Forbidden: You do not have the required role.']);
    }

    /**
     * Test successful retrieval and tenant isolation.
     */
    public function test_admin_receives_only_own_tenant_overview_stats(): void
    {
        // Setup academic year and section for seeding
        $anneeA = AnneeScolaire::create([
            'etablissement_id' => $this->etablissementA->id,
            'libelle' => '2025/2026',
        ]);
        $anneeB = AnneeScolaire::create([
            'etablissement_id' => $this->etablissementB->id,
            'libelle' => '2025/2026',
        ]);

        $sectionA = Section::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Collège',
        ]);
        $sectionB = Section::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'Collège',
        ]);

        // Create 2 classes in Etablissement A
        $classA1 = Classe::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Class A1',
            'niveau' => '6ème',
            'section_id' => $sectionA->id,
            'annee_scolaire_id' => $anneeA->id,
        ]);
        $classA2 = Classe::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Class A2',
            'niveau' => '5ème',
            'section_id' => $sectionA->id,
            'annee_scolaire_id' => $anneeA->id,
        ]);

        // Create 1 class in Etablissement B
        $classB1 = Classe::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'Class B1',
            'niveau' => '6ème',
            'section_id' => $sectionB->id,
            'annee_scolaire_id' => $anneeB->id,
        ]);

        // Seed 3 students in Etablissement A
        for ($i = 0; $i < 3; $i++) {
            $user = User::create([
                'etablissement_id' => $this->etablissementA->id,
                'nom' => 'EleveA' . $i,
                'prenom' => 'Test',
                'email' => "eleveA{$i}@test.com",
                'password' => bcrypt('password123'),
                'role' => 'eleve',
            ]);
            Eleve::create([
                'etablissement_id' => $this->etablissementA->id,
                'user_id' => $user->id,
                'matricule' => 'MAT-A-' . $i,
                'nom' => 'EleveA' . $i,
                'prenom' => 'Test',
                'classe_id' => $classA1->id,
                'classe_nom' => $classA1->nom,
                'status' => 'Active',
            ]);
        }

        // Seed 1 student in Etablissement B
        $userB = User::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'EleveB',
            'prenom' => 'Test',
            'email' => 'eleveB@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);
        Eleve::create([
            'etablissement_id' => $this->etablissementB->id,
            'user_id' => $userB->id,
            'matricule' => 'MAT-B-1',
            'nom' => 'EleveB',
            'prenom' => 'Test',
            'classe_id' => $classB1->id,
            'classe_nom' => $classB1->nom,
            'status' => 'Active',
        ]);

        // Request stats as Admin A -> should only see Etablissement A stats (3 students, 2 classes)
        $responseA = $this->actingAs($this->adminA)
            ->getJson('/api/v1/admin/stats/overview');

        $responseA->assertStatus(200)
            ->assertJson([
                'data' => [
                    'total_eleves' => 3,
                    'total_classes' => 2,
                ]
            ]);

        // Request stats as Admin B -> should only see Etablissement B stats (1 student, 1 class)
        $responseB = $this->actingAs($this->adminB)
            ->getJson('/api/v1/admin/stats/overview');

        $responseB->assertStatus(200)
            ->assertJson([
                'data' => [
                    'total_eleves' => 1,
                    'total_classes' => 1,
                ]
            ]);
    }
}
