<?php

namespace Database\Seeders;

use App\Models\Matiere;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        $etablissement = Etablissement::first();

        $subjects = [
            ['nom' => 'Mathématiques', 'code' => 'MATH'],
            ['nom' => 'Physique-Chimie', 'code' => 'PHYS'],
            ['nom' => 'Français', 'code' => 'FRAN'],
            ['nom' => 'Anglais', 'code' => 'ANGL'],
            ['nom' => 'Histoire-Géographie', 'code' => 'HIST'],
        ];

        foreach ($subjects as $s) {
            Matiere::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $s['nom'],
                'code' => $s['code'],
            ]);
        }
    }
}
