<?php

namespace Tests\Feature\Finance;

use App\Models\User;
use App\Models\Etablissement;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\Section;
use App\Models\AnneeScolaire;
use App\Models\GroupeFrais;
use App\Models\TypeFrais;
use App\Models\Frais;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinanceFeeApiTest extends TestCase
{
    use RefreshDatabase;

    private User $comptable;
    private Etablissement $etablissement;
    private Eleve $student;
    private Classe $class;
    private GroupeFrais $group;
    private TypeFrais $type;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissement = Etablissement::create([
            'nom' => 'Test GS',
            'code' => 'TGS'
        ]);

        $this->comptable = User::create([
            'email' => 'comptable@test.com',
            'nom' => 'Comptable',
            'prenom' => 'Test',
            'role' => 'comptable',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $section = Section::create([
            'nom' => 'Primaire',
            'etablissement_id' => $this->etablissement->id
        ]);

        // Create AnneeScolaire which is required by classes table
        $annee = AnneeScolaire::create([
            'libelle' => '2025-2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
            'etablissement_id' => $this->etablissement->id
        ]);

        $this->class = Classe::create([
            'nom' => 'CE1',
            'section_id' => $section->id,
            'annee_scolaire_id' => $annee->id,
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->student = Eleve::create([
            'nom' => 'Rami',
            'prenom' => 'Ali',
            'matricule' => 'STU999',
            'classe_id' => $this->class->id,
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->group = GroupeFrais::create([
            'nom' => 'Scolarite',
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->type = TypeFrais::create([
            'libelle' => 'Mensuel',
            'groupe_frais_id' => $this->group->id,
            'montant_par_defaut' => 500.00,
            'etablissement_id' => $this->etablissement->id,
        ]);

        Sanctum::actingAs($this->comptable);
    }

    public function test_can_assign_fees_to_student(): void
    {
        $response = $this->postJson('/api/finance/fees/assign', [
            'type_frais_ids' => [$this->type->id],
            'eleve_id' => $this->student->id,
            'date_echeance' => date('Y-m-d', strtotime('+30 days')),
            'annee_scolaire' => '2025-2026'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Frais assignés avec succès')
            ->assertJsonStructure(['data' => [['id', 'montant', 'statut']]]);

        $this->assertDatabaseHas('frais', [
            'eleve_id' => $this->student->id,
            'type_frais_id' => $this->type->id,
            'montant' => 500.00
        ]);
    }

    public function test_can_apply_remise_to_fee(): void
    {
        $fee = Frais::create([
            'type_frais_id' => $this->type->id,
            'eleve_id' => $this->student->id,
            'etablissement_id' => $this->etablissement->id,
            'montant' => 500.00,
            'date_echeance' => date('Y-m-d', strtotime('+10 days')),
            'statut' => 'en_attente'
        ]);

        $response = $this->postJson("/api/finance/fees/{$fee->id}/remise", [
            'pourcentage' => 10.00,
            'motif' => 'Reduction'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Remise appliquée');

        $this->assertDatabaseHas('remises', [
            'frais_id' => $fee->id,
            'pourcentage' => 10.00
        ]);
    }

    public function test_can_apply_penalite_to_fee(): void
    {
        $fee = Frais::create([
            'type_frais_id' => $this->type->id,
            'eleve_id' => $this->student->id,
            'etablissement_id' => $this->etablissement->id,
            'montant' => 500.00,
            'date_echeance' => date('Y-m-d', strtotime('+10 days')),
            'statut' => 'en_attente'
        ]);

        $response = $this->postJson("/api/finance/fees/{$fee->id}/penalite", [
            'montant' => 50.00,
            'motif' => 'Retard'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Pénalité appliquée');

        $this->assertDatabaseHas('penalites', [
            'frais_id' => $fee->id,
            'montant' => 50.00
        ]);
    }
}
