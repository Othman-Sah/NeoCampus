<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Section;
use App\Models\AnneeScolaire;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Enseignant;
use App\Models\Eleve;
use App\Models\Seance;
use App\Models\Examen;
use App\Models\ParametresExamen;
use App\Models\DemandeExceptionNote;
use App\Models\DemandePlannificationExamen;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AcademicActivitiesTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $teacherUser;
    private Enseignant $teacher;
    private Etablissement $etablissement;
    private AnneeScolaire $academicYear;
    private Section $section;
    private Classe $class;
    private Matiere $subject;
    private Eleve $student;
    private Seance $seance;

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

        $this->teacherUser = User::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Alaoui',
            'prenom' => 'Mohamed',
            'email' => 'teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'enseignant',
        ]);

        $this->teacher = Enseignant::create([
            'etablissement_id' => $this->etablissement->id,
            'user_id' => $this->teacherUser->id,
            'specialite' => 'Mathématiques',
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

        $this->class = Classe::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => '6ème A',
            'niveau' => '6ème',
            'section_id' => $this->section->id,
            'annee_scolaire_id' => $this->academicYear->id,
        ]);

        $this->subject = Matiere::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Mathématiques',
            'code' => 'MATH',
        ]);

        $studentUser = User::create([
            'etablissement_id' => $this->etablissement->id,
            'nom' => 'Kamil',
            'prenom' => 'Youssef',
            'email' => 'youssef.kamil@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        $this->student = Eleve::create([
            'etablissement_id' => $this->etablissement->id,
            'user_id' => $studentUser->id,
            'matricule' => 'MAT-TEST-001',
            'nom' => 'Kamil',
            'prenom' => 'Youssef',
            'sexe' => 'Male',
            'date_naissance' => '2012-05-01',
            'classe_id' => $this->class->id,
        ]);

        $this->seance = Seance::create([
            'etablissement_id' => $this->etablissement->id,
            'jour' => 'Lundi',
            'heure_debut' => '08:00:00',
            'heure_fin' => '10:00:00',
            'classe_id' => $this->class->id,
            'enseignant_id' => $this->teacher->id,
            'matiere_id' => $this->subject->id,
        ]);
    }

    public function test_teacher_can_submit_bulk_attendance(): void
    {
        $response = $this->actingAs($this->teacherUser)
                         ->postJson('/api/presences/bulk', [
                             'seance_id' => $this->seance->id,
                             'date' => '2026-07-01',
                             'presences' => [
                                 [
                                     'eleve_id' => $this->student->id,
                                     'statut' => 'absent',
                                     'motif' => 'Rendez-vous médical',
                                 ]
                             ]
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.0.statut', 'absent')
                 ->assertJsonPath('data.0.motif', 'Rendez-vous médical');
    }

    public function test_grading_window_constraints_and_exception_workflow(): void
    {
        // 1. Setup default parameters where grading is LOCKED (e.g. debut/fin in past)
        ParametresExamen::create([
            'etablissement_id' => $this->etablissement->id,
            'periode_saisie_notes_debut' => '2026-01-01 00:00:00',
            'periode_saisie_notes_fin' => '2026-01-10 23:59:59',
            'force_admin_schedule' => false,
            'require_sujet_upload' => true,
        ]);

        $examen = Examen::create([
            'etablissement_id' => $this->etablissement->id,
            'intitule' => 'Devoir Surveillé 1',
            'classe_id' => $this->class->id,
            'matiere_id' => $this->subject->id,
            'status' => 'approved',
            'date' => '2026-06-15 08:00:00',
        ]);

        // 2. Submit notes while locked: must return 403 Forbidden
        $response = $this->actingAs($this->teacherUser)
                         ->postJson('/api/notes/bulk', [
                             'examen_id' => $examen->id,
                             'notes' => [
                                 [
                                     'eleve_id' => $this->student->id,
                                     'valeur' => 15.5,
                                 ]
                             ]
                         ]);

        $response->assertStatus(403);

        // 3. Teacher requests exception
        $response = $this->actingAs($this->teacherUser)
                         ->postJson('/api/notes/exceptions/request', [
                             'examen_id' => $examen->id,
                             'motif' => 'Retard dans la correction pour maladie',
                         ]);

        $response->assertStatus(201);
        $exceptionId = $response->json('data.id');

        // 4. Admin approves exception
        $response = $this->actingAs($this->admin)
                         ->postJson("/api/admin/notes/exceptions/{$exceptionId}/approve");

        $response->assertStatus(200);

        // 5. Submit notes again: must succeed now that exception is active
        $response = $this->actingAs($this->teacherUser)
                         ->postJson('/api/notes/bulk', [
                             'examen_id' => $examen->id,
                             'notes' => [
                                 [
                                     'eleve_id' => $this->student->id,
                                     'valeur' => 15.5,
                                 ]
                             ]
                         ]);

        $response->assertStatus(200)
                 ->assertJsonPath('data.0.valeur', 15.5);
    }

    public function test_teacher_can_propose_exam_schedule_and_upload_sujet(): void
    {
        ParametresExamen::create([
            'etablissement_id' => $this->etablissement->id,
            'periode_saisie_notes_debut' => '2026-06-01 00:00:00',
            'periode_saisie_notes_fin' => '2026-07-30 23:59:59',
            'force_admin_schedule' => false,
            'require_sujet_upload' => true,
        ]);

        // 1. Propose schedule
        $response = $this->actingAs($this->teacherUser)
                         ->postJson('/api/examens/propose-schedule', [
                             'intitule' => 'Examen National Blanc',
                             'classe_id' => $this->class->id,
                             'matiere_id' => $this->subject->id,
                             'date_proposee' => '2026-07-10 14:00:00',
                         ]);

        $response->assertStatus(201);
        $proposalId = $response->json('data.proposal.id');

        // 2. Admin reviews proposal
        $response = $this->actingAs($this->admin)
                         ->postJson("/api/admin/examens/schedule/{$proposalId}/review", [
                             'statut' => 'approved',
                         ]);

        $response->assertStatus(200);
        $examenId = $response->json('data.examen_id');

        // 3. Upload sujet file
        Storage::fake('public');
        $file = UploadedFile::fake()->create('sujet_maths.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->teacherUser)
                         ->postJson("/api/examens/{$examenId}/upload-sujet", [
                             'file' => $file,
                         ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->json('data.fichier_sujet'));
    }
}
