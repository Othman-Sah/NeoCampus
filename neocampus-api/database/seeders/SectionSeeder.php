<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $etablissement = Etablissement::first();

        Section::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Primaire',
        ]);

        Section::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Collège',
        ]);

        Section::create([
            'etablissement_id' => $etablissement->id,
            'nom' => 'Lycée',
        ]);
    }
}
