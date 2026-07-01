<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\User;
use App\Models\Etablissement;
use App\Models\Classe;
use App\Models\Section;
use App\Models\AnneeScolaire;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('fr_FR');
        $etablissement = Etablissement::first();

        if (!$etablissement) {
            $etablissement = Etablissement::create([
                'nom' => 'Groupe Scolaire EMSI',
                'adresse' => 'Casablanca, Maroc',
                'code' => 'EMSI_CASA',
            ]);
        }

        // Retrieve section and academic year
        $sectionCollege = Section::where('nom', 'Collège')->first();
        $sectionPrimaire = Section::where('nom', 'Primaire')->first();
        $sectionLycee = Section::where('nom', 'Lycée')->first();
        $anneeScolaire = AnneeScolaire::where('libelle', '2025/2026')->first();

        // Seed 8 classes across sections (Primaire: 2, Collège: 4, Lycée: 2)
        $classesToSeed = [
            // Primaire
            ['nom' => 'CM1-A', 'niveau' => 'CM1', 'section_id' => $sectionPrimaire->id],
            ['nom' => 'CM2-B', 'niveau' => 'CM2', 'section_id' => $sectionPrimaire->id],
            // Collège
            ['nom' => '6ème-A', 'niveau' => '6ème', 'section_id' => $sectionCollege->id],
            ['nom' => '5ème-B', 'niveau' => '5ème', 'section_id' => $sectionCollege->id],
            ['nom' => '4ème-A', 'niveau' => '4ème', 'section_id' => $sectionCollege->id],
            ['nom' => '3ème-B', 'niveau' => '3ème', 'section_id' => $sectionCollege->id],
            // Lycée
            ['nom' => 'Seconde-A', 'niveau' => 'Seconde', 'section_id' => $sectionLycee->id],
            ['nom' => 'Terminale-C', 'niveau' => 'Terminale', 'section_id' => $sectionLycee->id],
        ];

        $classes = [];
        foreach ($classesToSeed as $c) {
            $classes[] = Classe::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $c['nom'],
                'niveau' => $c['niveau'],
                'section_id' => $c['section_id'],
                'annee_scolaire_id' => $anneeScolaire->id,
            ]);
        }

        // Generate 50 students
        for ($i = 0; $i < 50; $i++) {
            $nom = $faker->lastName;
            $prenom = $faker->firstName;
            $email = strtolower($prenom . '.' . $nom . $i . '@neocampus.com');
            
            // Create user login account (if they need to access student portal)
            $user = User::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $nom,
                'prenom' => $prenom,
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'eleve',
            ]);

            // Parent contact JSON
            $parentContact = [
                'nom' => $faker->name,
                'relation' => $faker->randomElement(['Father', 'Mother', 'Guardian']),
                'telephone' => $faker->phoneNumber,
                'email' => $faker->safeEmail,
            ];

            // Mock document upload placeholders
            $documents = [
                'birth_certificate' => true,
                'previous_transcript' => true,
                'photos' => true,
            ];

            $classe = $classes[$i % count($classes)];

            // Create student record
            Eleve::create([
                'etablissement_id' => $etablissement->id,
                'user_id' => $user->id,
                'matricule' => 'MAT-2026-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
                'nom' => $nom,
                'prenom' => $prenom,
                'email' => $email,
                'sexe' => $faker->randomElement(['Male', 'Female']),
                'date_naissance' => $faker->dateTimeBetween('-18 years', '-6 years')->format('Y-m-d'),
                'classe_id' => $classe->id,
                'classe_nom' => $classe->nom,
                'status' => $faker->randomElement(['Active', 'Active', 'Active', 'Suspended']), // mostly active
                'parent_contact' => $parentContact,
                'documents' => $documents,
                'scolarite_anterieure' => $faker->randomElement(['Al Jabr School', 'La Residence School', 'Lycée Lyautey', 'Anisse Institution']),
            ]);
        }
    }
}
