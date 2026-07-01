<?php

namespace Database\Seeders;

use App\Models\AnneeScolaire;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class AnneeScolaireSeeder extends Seeder
{
    public function run(): void
    {
        $etablissement = Etablissement::first();

        AnneeScolaire::create([
            'etablissement_id' => $etablissement->id,
            'libelle' => '2025/2026',
            'date_debut' => '2025-09-01',
            'date_fin' => '2026-06-30',
        ]);

        AnneeScolaire::create([
            'etablissement_id' => $etablissement->id,
            'libelle' => '2026/2027',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
        ]);
    }
}
