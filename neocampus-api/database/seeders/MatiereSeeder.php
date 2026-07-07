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
            ['nom' => 'Mathématiques', 'code' => 'MATH', 'coefficient' => 5.00],
            ['nom' => 'Physique-Chimie', 'code' => 'PHYS', 'coefficient' => 4.00],
            ['nom' => 'Français', 'code' => 'FRAN', 'coefficient' => 3.00],
            ['nom' => 'Anglais', 'code' => 'ANGL', 'coefficient' => 3.00],
            ['nom' => 'Histoire-Géographie', 'code' => 'HIST', 'coefficient' => 2.00],
        ];

        foreach ($subjects as $s) {
            Matiere::updateOrCreate(
                [
                    'etablissement_id' => $etablissement->id,
                    'nom' => $s['nom'],
                ],
                [
                    'code' => $s['code'],
                    'coefficient' => $s['coefficient'],
                ]
            );
        }
    }
}
