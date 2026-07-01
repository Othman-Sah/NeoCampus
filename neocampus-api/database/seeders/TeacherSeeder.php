<?php

namespace Database\Seeders;

use App\Models\Enseignant;
use App\Models\User;
use App\Models\Etablissement;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\ChargeHoraire;
use App\Models\EnseignantSalaire;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');
        $etablissement = Etablissement::first();
        $classes = Classe::all();
        $matieres = Matiere::all();

        $specialties = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'Histoire-Géographie'];

        for ($i = 0; $i < 10; $i++) {
            $nom = $faker->lastName;
            $prenom = $faker->firstName;
            $email = strtolower($prenom . '.' . $nom . '@neocampus.com');

            $emailToUse = $i === 0 ? 'enseignant@neocampus.com' : $email;

            // 1. Resolve or Create User account
            $user = User::where('email', $emailToUse)->first();
            if (!$user) {
                $user = User::create([
                    'etablissement_id' => $etablissement->id,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'email' => $emailToUse,
                    'password' => Hash::make('password123'),
                    'role' => 'enseignant',
                ]);
            } else {
                // Ensure name matches Faker-generated names for variety, or leave it
                $user->update([
                    'nom' => $nom,
                    'prenom' => $prenom,
                ]);
            }

            // 2. Create Teacher profile
            $speciality = $specialties[$i % count($specialties)];
            $baseSalary = $faker->randomElement([5000, 6000, 7500, 8000, 9500]);
            $teacher = Enseignant::create([
                'etablissement_id' => $etablissement->id,
                'user_id' => $user->id,
                'specialite' => $speciality,
                'salaire_de_base' => $baseSalary,
            ]);

            // 3. Assign to 1-2 classes and matching subject
            $subject = $matieres->where('nom', $speciality)->first() ?? $matieres->first();
            if ($subject && $classes->count() > 0) {
                $class1 = $classes[$i % $classes->count()];
                ChargeHoraire::create([
                    'enseignant_id' => $teacher->id,
                    'matiere_id' => $subject->id,
                    'classe_id' => $class1->id,
                ]);

                $class2 = $classes[($i + 1) % $classes->count()];
                ChargeHoraire::create([
                    'enseignant_id' => $teacher->id,
                    'matiere_id' => $subject->id,
                    'classe_id' => $class2->id,
                ]);
            }

            // 4. Seed Salaries & Payouts (May and June 2026)
            
            // May 2026 - Paid
            $primesMay = $faker->randomElement([200, 400, 500, 0]);
            $indemMay = $faker->randomElement([150, 300, 0]);
            $retMay = $faker->randomElement([50, 100, 0]);
            $netMay = $baseSalary + $primesMay + $indemMay - $retMay;
            EnseignantSalaire::create([
                'enseignant_id' => $teacher->id,
                'etablissement_id' => $etablissement->id,
                'mois' => '2026-05',
                'salaire_de_base' => $baseSalary,
                'primes' => $primesMay,
                'indemnites' => $indemMay,
                'retenues' => $retMay,
                'salaire_net' => $netMay,
                'statut' => 'Paid',
                'date_paiement' => '2026-05-28',
                'notes' => 'Salaire versé par virement bancaire.',
            ]);

            // June 2026 - Mixed
            $primesJune = $faker->randomElement([300, 600, 800, 0]);
            $indemJune = $faker->randomElement([200, 400, 0]);
            $retJune = $faker->randomElement([50, 150, 0]);
            $netJune = $baseSalary + $primesJune + $indemJune - $retJune;
            $statutJune = $i % 3 === 0 ? 'Draft' : 'Paid';
            EnseignantSalaire::create([
                'enseignant_id' => $teacher->id,
                'etablissement_id' => $etablissement->id,
                'mois' => '2026-06',
                'salaire_de_base' => $baseSalary,
                'primes' => $primesJune,
                'indemnites' => $indemJune,
                'retenues' => $retJune,
                'salaire_net' => $netJune,
                'statut' => $statutJune,
                'date_paiement' => $statutJune === 'Paid' ? '2026-06-27' : null,
                'notes' => $statutJune === 'Paid' ? 'Salaire versé par virement bancaire.' : 'Calcul en cours pour validation comptable.',
            ]);
        }
    }
}
