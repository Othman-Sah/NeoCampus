<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\TypeEvaluation;
use Illuminate\Database\Seeder;

class TypeEvaluationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        $types = [
            [
                'nom' => 'Devoir Surveillé',
                'code' => 'DS',
                'poids_defaut' => 1.0,
            ],
            [
                'nom' => 'Examen Final',
                'code' => 'EF',
                'poids_defaut' => 2.0,
            ],
            [
                'nom' => 'Contrôle Continu',
                'code' => 'CC',
                'poids_defaut' => 1.0,
            ],
            [
                'nom' => 'TP/Pratique',
                'code' => 'TP',
                'poids_defaut' => 0.5,
            ],
            [
                'nom' => 'Oral',
                'code' => 'ORAL',
                'poids_defaut' => 0.5,
            ],
            [
                'nom' => 'Projet',
                'code' => 'PROJ',
                'poids_defaut' => 1.0,
            ],
        ];

        foreach ($types as $type) {
            TypeEvaluation::updateOrCreate(
                [
                    'etablissement_id' => $etablissement->id,
                    'code' => $type['code']
                ],
                [
                    'nom' => $type['nom'],
                    'poids_defaut' => $type['poids_defaut']
                ]
            );
        }
    }
}
