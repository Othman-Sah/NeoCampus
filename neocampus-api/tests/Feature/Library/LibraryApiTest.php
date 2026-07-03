<?php

namespace Tests\Feature\Library;

use App\Models\Adherent;
use App\Models\Etablissement;
use App\Models\Livre;
use App\Models\Emprunt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LibraryApiTest extends TestCase
{
    use RefreshDatabase;

    private Etablissement $etablissement;
    private User $bibliothecaire;
    private User $studentUser;
    private Adherent $adherent;
    private Livre $book;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissement = Etablissement::create([
            'nom' => 'Test EMSI',
            'code' => 'TEMSI'
        ]);

        $this->bibliothecaire = User::create([
            'email' => 'biblio@test.com',
            'nom' => 'Biblio',
            'prenom' => 'Test',
            'role' => 'bibliothecaire',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->studentUser = User::create([
            'email' => 'student@test.com',
            'nom' => 'Student',
            'prenom' => 'Test',
            'role' => 'eleve',
            'password' => bcrypt('password123'),
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->adherent = Adherent::create([
            'user_id' => $this->studentUser->id,
            'user_type' => \App\Models\Eleve::class,
            'etablissement_id' => $this->etablissement->id,
        ]);

        $this->book = Livre::create([
            'titre' => 'Le Petit Prince',
            'auteur' => 'Antoine de Saint-Exupéry',
            'isbn' => '9782070612758',
            'genre' => 'Conte',
            'quantite_stock' => 3,
            'etablissement_id' => $this->etablissement->id,
        ]);

        // Default settings
        DB::table('library_settings')->insert([
            [
                'etablissement_id' => $this->etablissement->id,
                'key' => 'max_loans_per_member',
                'value' => json_encode(5),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'etablissement_id' => $this->etablissement->id,
                'key' => 'loan_duration_days',
                'value' => json_encode(14),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'etablissement_id' => $this->etablissement->id,
                'key' => 'fine_per_day_mad',
                'value' => json_encode(2),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);

        Sanctum::actingAs($this->bibliothecaire);
    }

    public function test_can_list_books_catalog(): void
    {
        $response = $this->getJson('/api/v1/library/books');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'titre', 'auteur', 'isbn', 'genre', 'quantite_stock', 'disponible']]]);
    }

    public function test_can_search_books(): void
    {
        $response = $this->getJson('/api/v1/library/books?q=Prince');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.titre', 'Le Petit Prince');
    }

    public function test_can_add_book_to_catalog(): void
    {
        $response = $this->postJson('/api/v1/library/books', [
            'titre' => 'L\'Étranger',
            'auteur' => 'Albert Camus',
            'isbn' => '9782070360024',
            'genre' => 'Roman',
            'quantite_stock' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.titre', 'L\'Étranger')
            ->assertJsonPath('data.isbn', '9782070360024');

        $this->assertDatabaseHas('livres', [
            'isbn' => '9782070360024',
            'etablissement_id' => $this->etablissement->id,
        ]);
    }

    public function test_can_update_book(): void
    {
        $response = $this->putJson("/api/v1/library/books/{$this->book->id}", [
            'titre' => 'Le Petit Prince (Édition Spéciale)',
            'quantite_stock' => 10,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.titre', 'Le Petit Prince (Édition Spéciale)')
            ->assertJsonPath('data.quantite_stock', 10);

        $this->assertDatabaseHas('livres', [
            'id' => $this->book->id,
            'quantite_stock' => 10,
        ]);
    }

    public function test_can_soft_delete_book(): void
    {
        $response = $this->deleteJson("/api/v1/library/books/{$this->book->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Livre supprimé avec succès.');

        $this->assertSoftDeleted('livres', [
            'id' => $this->book->id,
        ]);
    }

    public function test_can_create_book_loan(): void
    {
        $response = $this->postJson('/api/v1/library/loans', [
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'book', 'adherent', 'date_emprunt', 'date_retour_prevue', 'statut']]);

        $this->assertDatabaseHas('emprunts', [
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
            'statut' => 'en_cours',
        ]);
    }

    public function test_can_return_book_loan(): void
    {
        $loan = Emprunt::create([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
            'date_emprunt' => now()->toDateString(),
            'date_retour_prevue' => now()->addDays(14)->toDateString(),
            'statut' => 'en_cours',
            'etablissement_id' => $this->etablissement->id,
        ]);

        $response = $this->putJson("/api/v1/library/loans/{$loan->id}/return");

        $response->assertStatus(200)
            ->assertJsonPath('data.statut', 'rendu');
            
        $this->assertNotNull($response->json('data.date_retour_effective'));

        $this->assertDatabaseHas('emprunts', [
            'id' => $loan->id,
            'statut' => 'rendu',
        ]);
    }

    public function test_can_get_overdue_loans(): void
    {
        // Create an overdue loan
        Emprunt::create([
            'livre_id' => $this->book->id,
            'adherent_id' => $this->adherent->id,
            'date_emprunt' => now()->subDays(20)->toDateString(),
            'date_retour_prevue' => now()->subDays(6)->toDateString(), // Overdue
            'statut' => 'en_cours',
            'etablissement_id' => $this->etablissement->id,
        ]);

        $response = $this->getJson('/api/v1/library/overdue');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'jours_retard', 'amende']]]);
    }

    public function test_can_get_dashboard_stats(): void
    {
        $response = $this->getJson('/api/v1/library/stats');

        $response->assertStatus(200)
            ->assertJson([
                'total_books' => 3,
                'active_loans' => 0,
                'overdue_loans' => 0,
            ]);
    }
}
