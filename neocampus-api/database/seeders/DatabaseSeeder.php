<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create a default Etablissement
        $etablissement = Etablissement::firstOrCreate(
            ['code' => 'EMSI_CASA'],
            [
                'nom' => 'Groupe Scolaire EMSI',
                'adresse' => 'Casablanca, Maroc',
            ]
        );

        // 2. Create the test Admin account
        User::firstOrCreate(
            ['email' => 'admin@neocampus.com'],
            [
                'etablissement_id' => $etablissement->id,
                'nom' => 'Sahraoui',
                'prenom' => 'Othman',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 3. Create the other test accounts for mock login
        $roles = ['comptable', 'enseignant', 'bibliothecaire', 'parent', 'eleve'];
        foreach ($roles as $role) {
            User::firstOrCreate(
                ['email' => $role . '@neocampus.com'],
                [
                    'etablissement_id' => $etablissement->id,
                    'nom' => ucfirst($role),
                    'prenom' => 'Test',
                    'password' => Hash::make('password123'),
                    'role' => $role,
                ]
            );
        }

        // 4. Run Seeders
        $this->call([
            AnneeScolaireSeeder::class,
            SectionSeeder::class,
            MatiereSeeder::class,
            StudentSeeder::class,
            TeacherSeeder::class,
            SeanceSeeder::class,
            ExamParamSeeder::class,
            FinanceSeeder::class,
            LibrarySeeder::class,
        ]);
    }
}
