<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Livre;
use App\Models\Adherent;
use App\Models\Emprunt;
use App\Application\Services\EstablishmentBootstrapper;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class LibrarySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('en_US');
        $bootstrapper = new EstablishmentBootstrapper();

        // 1. Retrieve all active establishments
        $etablissements = Etablissement::all();

        foreach ($etablissements as $etab) {
            // Bootstrap the library settings default rows for this tenant
            $bootstrapper->bootstrapLibrary($etab->id);

            // Seed 50 Books for this establishment with realistic English titles
            $genres = ['Romance', 'Science Fiction', 'Fantasy', 'Thriller', 'History', 'Biography', 'Poetry', 'Drama', 'Philosophy', 'Self-Help'];
            $books = [];
            for ($i = 0; $i < 50; $i++) {
                $books[] = Livre::create([
                    'titre' => $faker->catchPhrase,
                    'auteur' => $faker->name,
                    'isbn' => $faker->isbn13(),
                    'genre' => $faker->randomElement($genres),
                    'quantite_stock' => $faker->numberBetween(2, 12),
                    'etablissement_id' => $etab->id,
                ]);
            }

            // Seed Adherents for existing users (eleve + enseignant)
            $users = User::where('etablissement_id', $etab->id)
                ->whereIn('role', ['eleve', 'enseignant'])
                ->get();

            $adherents = [];
            foreach ($users as $user) {
                $userType = $user->role === 'eleve' ? \App\Models\Eleve::class : \App\Models\Enseignant::class;
                $adherents[] = Adherent::firstOrCreate(
                    [
                        'user_id' => $user->id,
                        'user_type' => $userType,
                        'etablissement_id' => $etab->id,
                    ]
                );
            }

            if (empty($adherents) || empty($books)) {
                continue;
            }

            // Seed 30 Loans for this establishment
            for ($i = 0; $i < 30; $i++) {
                $book = $faker->randomElement($books);
                $adherent = $faker->randomElement($adherents);

                $statut = $faker->randomElement(['en_cours', 'rendu', 'en_retard']);
                $dateEmprunt = $faker->dateTimeBetween('-45 days', '-15 days');
                $dateEmpruntStr = $dateEmprunt->format('Y-m-d');

                if ($statut === 'rendu') {
                    $dateRetourPrevue = (clone $dateEmprunt)->modify('+14 days');
                    $dateRetourEffective = (clone $dateEmprunt)->modify('+' . rand(1, 13) . ' days');
                    $dateRetourPrevueStr = $dateRetourPrevue->format('Y-m-d');
                    $dateRetourEffectiveStr = $dateRetourEffective->format('Y-m-d');
                } elseif ($statut === 'en_retard') {
                    // Due date is in the past (e.g. 10 days after loan, which was 15 to 45 days ago)
                    $dateRetourPrevue = (clone $dateEmprunt)->modify('+10 days');
                    $dateRetourPrevueStr = $dateRetourPrevue->format('Y-m-d');
                    $dateRetourEffectiveStr = null;
                } else { // en_cours
                    // Due date is in the future
                    $dateRetourPrevue = now()->addDays(rand(2, 12));
                    $dateRetourPrevueStr = $dateRetourPrevue->format('Y-m-d');
                    $dateRetourEffectiveStr = null;
                }

                Emprunt::create([
                    'livre_id' => $book->id,
                    'adherent_id' => $adherent->id,
                    'date_emprunt' => $dateEmpruntStr,
                    'date_retour_prevue' => $dateRetourPrevueStr,
                    'date_retour_effective' => $dateRetourEffectiveStr,
                    'statut' => $statut,
                    'etablissement_id' => $etab->id,
                ]);
            }
        }
    }
}
