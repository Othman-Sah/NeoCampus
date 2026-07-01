<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Section;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Enseignant;
use App\Models\EnseignantSalaire;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $comptable;
    private Etablissement $etablissement;
    private AnneeScolaire $academicYear;
    private Section $section;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissement = Etablissement::create([
            'nom' => 'Test EMSI GS',
            'code' => 'TEST_EMSI',
        ]);

        $this->admin = User::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Admin',
            'prenom' => 'Super',
            'email' => 'admin@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->comptable = User::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Comptable',
            'prenom' => 'Test',
            'email' => 'comptable@test.com',
            'password' => bcrypt('password123'),
            'role' => 'comptable',
        ]);

        $this->academicYear = AnneeScolaire::create([
            'etablissement_id' => $this->etablissement->id,
            'libelle' => '2025/2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
        ]);

        $this->section = Section::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Collège',
        ]);
    }

    public function test_admin_can_manage_sections(): void
    {
        $response = $this->actingAs($this->admin)
                         ->postJson('/api/admin/sections', [
                             'nom' => 'Lycée',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.nom', 'Lycée');

        $response = $this->actingAs($this->admin)
                         ->getJson('/api/admin/sections');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data'); // 'Collège' from setUp and 'Lycée'
    }

    public function test_admin_can_manage_classes(): void
    {
        $response = $this->actingAs($this->admin)
                         ->postJson('/api/admin/classes', [
                             'nom' => '6ème A',
                             'niveau' => '6ème',
                             'section_id' => $this->section->id,
                             'annee_scolaire_id' => $this->academicYear->id,
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.nom', '6ème A');

        $response = $this->actingAs($this->admin)
                         ->getJson('/api/admin/classes');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_manage_teachers(): void
    {
        $subject = Matiere::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Mathématiques',
            'code' => 'MATH',
        ]);

        $response = $this->actingAs($this->admin)
                          ->postJson('/api/admin/enseignants', [
                              'nom' => 'Alaoui',
                              'prenom' => 'Mohamed',
                              'email' => 'mohamed.alaoui@test.com',
                              'specialite' => 'Mathématiques',
                              'salaire_de_base' => 7500,
                              'avatar' => 'data:image/png;base64,iVBORw55ErkJggg==',
                          ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.specialite', 'Mathématiques')
                 ->assertJsonPath('data.salaire_de_base', 7500)
                 ->assertJsonPath('data.user.avatar', 'data:image/png;base64,iVBORw55ErkJggg==')
                 ->assertJsonPath('data.user.email', 'mohamed.alaoui@test.com');

        $teacherId = $response->json('data.id');

        $class = Classe::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => '6ème B',
            'niveau' => '6ème',
            'section_id' => $this->section->id,
            'annee_scolaire_id' => $this->academicYear->id,
        ]);

        $response = $this->actingAs($this->admin)
                         ->postJson('/api/admin/enseignants/assign', [
                             'enseignant_id' => $teacherId,
                             'classe_id' => $class->id,
                             'matiere_id' => $subject->id,
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('success', true);

        $response = $this->actingAs($this->admin)
                         ->getJson("/api/admin/enseignants/{$teacherId}");

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data.classes');
    }

    public function test_comptable_can_manage_salaries(): void
    {
        $teacherUser = User::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Naji',
            'prenom' => 'Imad',
            'email' => 'imad.naji@test.com',
            'password' => bcrypt('password123'),
            'role' => 'enseignant',
        ]);

        $teacher = Enseignant::create([
            'etablissement_id' => $this->etablissement->id,
            'user_id' => $teacherUser->id,
            'specialite' => 'Physique-Chimie',
        ]);

        $response = $this->actingAs($this->comptable)
                         ->postJson('/api/finance/salaires', [
                             'enseignant_id' => $teacher->id,
                             'mois' => '2026-06',
                             'salaire_de_base' => 8000,
                             'primes' => 500,
                             'indemnites' => 300,
                             'retenues' => 100,
                             'statut' => 'Draft',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.salaire_net', 8700)
                 ->assertJsonPath('data.statut', 'Draft');

        $salaryId = $response->json('data.id');

        $response = $this->actingAs($teacherUser)
                         ->getJson('/api/teacher/salaires');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.salaire_net', 8700);

        $response = $this->actingAs($this->comptable)
                         ->putJson("/api/finance/salaires/{$salaryId}", [
                             'enseignant_id' => $teacher->id,
                             'mois' => '2026-06',
                             'statut' => 'Paid',
                             'date_paiement' => '2026-06-30',
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.statut', 'Paid')
                 ->assertJsonPath('data.date_paiement', '2026-06-30');
    }
}
