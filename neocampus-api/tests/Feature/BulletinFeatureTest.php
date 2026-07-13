<?php

namespace Tests\Feature;

use App\Models\AnneeScolaire;
use App\Models\Bulletin;
use App\Models\BulletinDetail;
use App\Models\ChargeHoraire;
use App\Models\Classe;
use App\Models\Dispense;
use App\Models\Eleve;
use App\Models\Enseignant;
use App\Models\Etablissement;
use App\Models\Examen;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BulletinFeatureTest extends TestCase
{
    use RefreshDatabase;

    private Etablissement $etablissementA;
    private Etablissement $etablissementB;
    private User $adminA;
    private User $adminB;
    private User $teacherUser;
    private Enseignant $teacher;
    private Classe $classA;
    private Matiere $math;
    private Matiere $french;
    private Eleve $student1;
    private Eleve $student2;
    private User $student1User;
    private User $student2User;
    private User $parent1User;

    protected function setUp(): void
    {
        parent::setUp();

        // Create Tenant A
        $this->etablissementA = Etablissement::create([
            'nom' => 'GS EMSI A',
            'code' => 'EMSI_A',
            'logo' => 'https://example.com/logoA.png',
        ]);

        // Create Tenant B
        $this->etablissementB = Etablissement::create([
            'nom' => 'GS EMSI B',
            'code' => 'EMSI_B',
            'logo' => 'https://example.com/logoB.png',
        ]);

        // Create Admins
        $this->adminA = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'AdminA',
            'prenom' => 'Test',
            'email' => 'adminA@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $this->adminB = User::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'AdminB',
            'prenom' => 'Test',
            'email' => 'adminB@test.com',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        // Create Section and Academic Year for Tenant A
        $section = Section::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Collège',
        ]);

        $annee = AnneeScolaire::create([
            'etablissement_id' => $this->etablissementA->id,
            'libelle' => '2025/2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
        ]);

        $this->classA = Classe::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => '3ème A',
            'niveau' => '3ème',
            'section_id' => $section->id,
            'annee_scolaire_id' => $annee->id,
        ]);

        // Create Subjects
        $this->math = Matiere::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Mathématiques',
            'code' => 'MATH',
            'coefficient' => 5.00,
        ]);

        $this->french = Matiere::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Français',
            'code' => 'FRAN',
            'coefficient' => 3.00,
        ]);

        // Create Teacher
        $this->teacherUser = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Teacher',
            'prenom' => 'Test',
            'email' => 'teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'enseignant',
        ]);

        $this->teacher = Enseignant::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $this->teacherUser->id,
            'matricule' => 'PROF-001',
            'nom' => 'Teacher',
            'prenom' => 'Test',
            'specialite' => 'MATH',
        ]);

        // Assign teacher to class & subjects
        ChargeHoraire::create([
            'enseignant_id' => $this->teacher->id,
            'matiere_id' => $this->math->id,
            'classe_id' => $this->classA->id,
        ]);

        // Create another teacher for French
        $frenchTeacherUser = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'FrenchTeacher',
            'prenom' => 'Test',
            'email' => 'french_teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'enseignant',
        ]);

        $frenchTeacher = Enseignant::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $frenchTeacherUser->id,
            'matricule' => 'PROF-002',
            'nom' => 'FrenchTeacher',
            'prenom' => 'Test',
            'specialite' => 'FRAN',
        ]);

        ChargeHoraire::create([
            'enseignant_id' => $frenchTeacher->id,
            'matiere_id' => $this->french->id,
            'classe_id' => $this->classA->id,
        ]);

        $this->classA->matieres()->attach($this->math->id, ['etablissement_id' => $this->etablissementA->id]);
        $this->classA->matieres()->attach($this->french->id, ['etablissement_id' => $this->etablissementA->id]);


        // Create Students
        $this->student1User = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Student1',
            'prenom' => 'Test',
            'email' => 'student1@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        $this->student1 = Eleve::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $this->student1User->id,
            'matricule' => 'MAT-001',
            'nom' => 'Student1',
            'prenom' => 'Test',
            'classe_id' => $this->classA->id,
            'parent_contact' => [
                'nom' => 'Parent1',
                'relation' => 'Father',
                'email' => 'parent1@test.com',
                'telephone' => '123456',
            ],
        ]);

        $this->student2User = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Student2',
            'prenom' => 'Test',
            'email' => 'student2@test.com',
            'password' => bcrypt('password123'),
            'role' => 'eleve',
        ]);

        $this->student2 = Eleve::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $this->student2User->id,
            'matricule' => 'MAT-002',
            'nom' => 'Student2',
            'prenom' => 'Test',
            'classe_id' => $this->classA->id,
        ]);

        // Create Parent user account
        $this->parent1User = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Parent1',
            'prenom' => 'Test',
            'email' => 'parent1@test.com',
            'password' => bcrypt('password123'),
            'role' => 'parent',
        ]);
    }

    /**
     * Test bulk generation.
     */
    public function test_admin_can_generate_bulletins_in_bulk(): void
    {
        // Create completed Math Exam
        $examMath = Examen::create([
            'etablissement_id' => $this->etablissementA->id,
            'date' => '2026-06-10 10:00:00',
            'intitule' => 'Math Exam',
            'classe_id' => $this->classA->id,
            'matiere_id' => $this->math->id,
            'status' => 'completed',
            'periode' => 'Trimestre 1',
        ]);

        // Seed grades for students: Student 1 has 18, Student 2 has 12
        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examMath->id,
            'eleve_id' => $this->student1->id,
            'valeur' => 18.00,
        ]);

        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examMath->id,
            'eleve_id' => $this->student2->id,
            'valeur' => 12.00,
        ]);

        // Call bulk generate
        $response = $this->actingAs($this->adminA)
            ->postJson('/api/bulletins/generate/bulk', [
                'classe_id' => $this->classA->id,
                'periode' => 'Trimestre 1',
                'annee_scolaire' => '2025/2026',
            ]);

        $response->assertStatus(200);

        // Assert database records: Student 1 has rank 1, Student 2 has rank 2
        $this->assertDatabaseHas('bulletins', [
            'eleve_id' => $this->student1->id,
            'moyenne_generale' => 18.00,
            'rang_classe' => 1,
            'status' => 'DRAFT',
        ]);

        $this->assertDatabaseHas('bulletins', [
            'eleve_id' => $this->student2->id,
            'moyenne_generale' => 12.00,
            'rang_classe' => 2,
        ]);
    }

    /**
     * Test single generation and exemption logic.
     */
    public function test_exempted_subject_is_excluded_from_average(): void
    {
        // Math and French completed exams
        $examMath = Examen::create([
            'etablissement_id' => $this->etablissementA->id,
            'date' => '2026-06-10 10:00:00',
            'intitule' => 'Math Exam',
            'classe_id' => $this->classA->id,
            'matiere_id' => $this->math->id,
            'status' => 'completed',
            'periode' => 'Trimestre 1',
        ]);

        $examFrench = Examen::create([
            'etablissement_id' => $this->etablissementA->id,
            'date' => '2026-06-12 10:00:00',
            'intitule' => 'French Exam',
            'classe_id' => $this->classA->id,
            'matiere_id' => $this->french->id,
            'status' => 'completed',
            'periode' => 'Trimestre 1',
        ]);

        // Student 1 has 15 in Math and 10 in French
        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examMath->id,
            'eleve_id' => $this->student1->id,
            'valeur' => 15.00,
        ]);

        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examFrench->id,
            'eleve_id' => $this->student1->id,
            'valeur' => 10.00,
        ]);

        // Student 1 is exempt from Math
        Dispense::create([
            'etablissement_id' => $this->etablissementA->id,
            'eleve_id' => $this->student1->id,
            'matiere_id' => $this->math->id,
        ]);

        // Generate single bulletin for Student 1
        $response = $this->actingAs($this->adminA)
            ->postJson('/api/bulletins/generate/single', [
                'eleve_id' => $this->student1->id,
                'periode' => 'Trimestre 1',
                'annee_scolaire' => '2025/2026',
            ]);

        $response->assertStatus(200);

        // Since student is exempt from Math (coef 5, average 15),
        // only French (coef 3, average 10) is counted.
        // Overall average should be 10.00 (instead of (15*5 + 10*3)/8 = 13.125)
        $this->assertDatabaseHas('bulletins', [
            'eleve_id' => $this->student1->id,
            'moyenne_generale' => 10.00,
        ]);

        // Math detail line should NOT exist for this student's bulletin
        $bulletin = Bulletin::where('eleve_id', $this->student1->id)->first();
        $this->assertDatabaseMissing('bulletin_details', [
            'bulletin_id' => $bulletin->id,
            'matiere_id' => $this->math->id,
        ]);
    }

    /**
     * Test cross tenant isolation.
     */
    public function test_cross_tenant_isolation_prevents_leakage(): void
    {
        // Create an exam in Tenant A
        $examMath = Examen::create([
            'etablissement_id' => $this->etablissementA->id,
            'date' => '2026-06-10 10:00:00',
            'intitule' => 'Math Exam',
            'classe_id' => $this->classA->id,
            'matiere_id' => $this->math->id,
            'status' => 'completed',
            'periode' => 'Trimestre 1',
        ]);

        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examMath->id,
            'eleve_id' => $this->student1->id,
            'valeur' => 16.00,
        ]);

        // Admin B (Tenant B) attempts to generate bulletins for Class A (Tenant A)
        $response = $this->actingAs($this->adminB)
            ->postJson('/api/bulletins/generate/bulk', [
                'classe_id' => $this->classA->id,
                'periode' => 'Trimestre 1',
                'annee_scolaire' => '2025/2026',
            ]);

        // Should return 404 (due to TenantScope filtering out Class A for Admin B)
        $response->assertStatus(404);
    }

    /**
     * Test student and parent access.
     */
    public function test_student_and_parent_access_restrictions(): void
    {
        // Math exam and grades
        $examMath = Examen::create([
            'etablissement_id' => $this->etablissementA->id,
            'date' => '2026-06-10 10:00:00',
            'intitule' => 'Math Exam',
            'classe_id' => $this->classA->id,
            'matiere_id' => $this->math->id,
            'status' => 'completed',
            'periode' => 'Trimestre 1',
        ]);

        Note::create([
            'etablissement_id' => $this->etablissementA->id,
            'examen_id' => $examMath->id,
            'eleve_id' => $this->student1->id,
            'valeur' => 16.00,
        ]);

        // Generate bulletin
        $this->actingAs($this->adminA)
            ->postJson('/api/bulletins/generate/bulk', [
                'classe_id' => $this->classA->id,
                'periode' => 'Trimestre 1',
                'annee_scolaire' => '2025/2026',
            ]);

        $bulletin = Bulletin::where('eleve_id', $this->student1->id)->firstOrFail();

        // 1. Student 1 views their own bulletin -> succeeds
        $response = $this->actingAs($this->student1User)
            ->getJson("/api/bulletins/{$bulletin->id}");
        $response->assertStatus(200);

        // 2. Student 2 views Student 1's bulletin -> forbidden (403)
        $response = $this->actingAs($this->student2User)
            ->getJson("/api/bulletins/{$bulletin->id}");
        $response->assertStatus(403);

        // 3. Parent 1 (linked to Student 1) views Student 1's bulletin -> succeeds
        $response = $this->actingAs($this->parent1User)
            ->getJson("/api/bulletins/{$bulletin->id}");
        $response->assertStatus(200);
    }
}
