<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class EstablishmentBootstrapper
{
    /**
     * Bootstrap all settings for a new establishment.
     *
     * @param int $etablissementId
     * @return void
     */
    public function bootstrapAll(int $etablissementId): void
    {
        $this->bootstrapLibrary($etablissementId);
        $this->bootstrapBulletins($etablissementId);
        $this->bootstrapFees($etablissementId);
    }

    /**
     * Bootstrap the library settings for a new establishment.
     *
     * @param int $etablissementId
     * @return void
     */
    public function bootstrapLibrary(int $etablissementId): void
    {
        $defaults = [
            'loan_duration_days' => 14,
            'max_loans_per_member' => 5,
            'fine_per_day_mad' => 2,
        ];

        foreach ($defaults as $key => $value) {
            DB::table('library_settings')->updateOrInsert(
                [
                    'etablissement_id' => $etablissementId,
                    'key' => $key,
                ],
                [
                    'value' => json_encode($value),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    /**
     * Bootstrap bulletin configurations.
     *
     * @param int $etablissementId
     * @return void
     */
    public function bootstrapBulletins(int $etablissementId): void
    {
        DB::table('bulletin_configs')->updateOrInsert(
            [
                'etablissement_id' => $etablissementId,
            ],
            [
                'format_periode' => 'trimestre',
                'seuil_encouragements' => 12.0,
                'seuil_tableau_honneur' => 14.0,
                'seuil_felicitations' => 16.0,
                'show_min_max' => true,
                'show_rang_matiere' => true,
                'show_detail_notes' => false,
                'show_sous_total_groupe' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Bootstrap default fee templates.
     *
     * @param int $etablissementId
     * @return void
     */
    public function bootstrapFees(int $etablissementId): void
    {
        // 1. Create a default fee group
        $groupId = DB::table('groupe_frais')->insertGetId([
            'nom' => 'Frais de Scolarité',
            'description' => "Frais d'inscription et scolarité mensuelle",
            'etablissement_id' => $etablissementId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Create default fee types inside this group
        $feeTypes = [
            [
                'libelle' => "Frais d'inscription",
                'montant_par_defaut' => 1000.00,
            ],
            [
                'libelle' => 'Mensualité',
                'montant_par_defaut' => 500.00,
            ]
        ];

        foreach ($feeTypes as $type) {
            DB::table('type_frais')->updateOrInsert(
                [
                    'etablissement_id' => $etablissementId,
                    'libelle' => $type['libelle'],
                ],
                [
                    'groupe_frais_id' => $groupId,
                    'montant_par_defaut' => $type['montant_par_defaut'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
