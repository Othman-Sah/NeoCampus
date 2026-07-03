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
use App\Models\Solde;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FinancePaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $comptable;
    private Etablissement $etablissement;
    private Eleve $student;
    private Classe $class;
    private GroupeFrais $group;
    private TypeFrais $type;
    private Frais $fee;

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

        $this->fee = Frais::create([
            'type_frais_id' => $this->type->id,
            'eleve_id' => $this->student->id,
            'etablissement_id' => $this->etablissement->id,
            'montant' => 500.00,
            'date_echeance' => date('Y-m-d', strtotime('+10 days')),
            'statut' => 'en_attente'
        ]);

        Solde::create([
            'eleve_id' => $this->student->id,
            'etablissement_id' => $this->etablissement->id,
            'montant_du' => 500.00,
            'montant_paye' => 0.00
        ]);

        Sanctum::actingAs($this->comptable);
    }

    public function test_can_record_payment(): void
    {
        $response = $this->postJson('/api/finance/payments', [
            'frais_id' => $this->fee->id,
            'montant_paye' => 200.00,
            'date_paiement' => date('Y-m-d'),
            'mode' => 'cash',
            'reference' => 'CASH123'
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('message', 'Paiement enregistré avec succès');

        $this->assertDatabaseHas('paiements', [
            'frais_id' => $this->fee->id,
            'montant_paye' => 200.00,
            'mode' => 'cash'
        ]);

        // Verify balance recalculation
        $this->assertDatabaseHas('soldes', [
            'eleve_id' => $this->student->id,
            'montant_paye' => 200.00
        ]);
    }

    public function test_can_get_student_balance_history(): void
    {
        $response = $this->getJson("/api/finance/students/{$this->student->id}/balance");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'student',
                    'fees',
                    'solde'
                ]
            ]);
    }

    public function test_can_get_financial_summary_reports(): void
    {
        $response = $this->getJson('/api/finance/reports/summary?from=' . date('Y-m-d') . '&to=' . date('Y-m-d'));

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'total_encaisse',
                    'soldes_impayes',
                    'paiements_aujourd_hui',
                    'masse_salariale',
                    'period'
                ]
            ]);
    }
}
