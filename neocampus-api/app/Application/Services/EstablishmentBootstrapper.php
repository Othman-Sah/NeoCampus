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

    private function getDefaultsConfig(): array
    {
        try {
            $setting = \App\Models\PlatformSetting::where('key', 'defaults')->first();
            if ($setting) {
                return $setting->value;
            }
        } catch (\Exception $e) {}

        return [
            'library_loan_duration_days' => 14,
            'library_max_loans_per_member' => 5,
            'library_fine_per_day_mad' => 2,
            'bulletin_format_periode' => 'trimestre',
            'bulletin_seuil_encouragements' => 12.0,
            'bulletin_seuil_tableau_honneur' => 14.0,
            'bulletin_seuil_felicitations' => 16.0,
            'bulletin_show_min_max' => true,
            'bulletin_show_rang_matiere' => true,
            'bulletin_show_detail_notes' => false,
            'bulletin_show_sous_total_groupe' => true,
            'fee_registration_montant' => 1000.00,
            'fee_monthly_montant' => 500.00,
        ];
    }

    /**
     * Bootstrap the library settings for a new establishment.
     *
     * @param int $etablissementId
     * @return void
     */
    public function bootstrapLibrary(int $etablissementId): void
    {
        $config = $this->getDefaultsConfig();
        $defaults = [
            'loan_duration_days' => $config['library_loan_duration_days'] ?? 14,
            'max_loans_per_member' => $config['library_max_loans_per_member'] ?? 5,
            'fine_per_day_mad' => $config['library_fine_per_day_mad'] ?? 2,
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
        $config = $this->getDefaultsConfig();
        DB::table('bulletin_configs')->updateOrInsert(
            [
                'etablissement_id' => $etablissementId,
            ],
            [
                'format_periode' => $config['bulletin_format_periode'] ?? 'trimestre',
                'seuil_encouragements' => (float) ($config['bulletin_seuil_encouragements'] ?? 12.0),
                'seuil_tableau_honneur' => (float) ($config['bulletin_seuil_tableau_honneur'] ?? 14.0),
                'seuil_felicitations' => (float) ($config['bulletin_seuil_felicitations'] ?? 16.0),
                'show_min_max' => (bool) ($config['bulletin_show_min_max'] ?? true),
                'show_rang_matiere' => (bool) ($config['bulletin_show_rang_matiere'] ?? true),
                'show_detail_notes' => (bool) ($config['bulletin_show_detail_notes'] ?? false),
                'show_sous_total_groupe' => (bool) ($config['bulletin_show_sous_total_groupe'] ?? true),
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
        $config = $this->getDefaultsConfig();
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
                'montant_par_defaut' => (float) ($config['fee_registration_montant'] ?? 1000.00),
            ],
            [
                'libelle' => 'Mensualité',
                'montant_par_defaut' => (float) ($config['fee_monthly_montant'] ?? 500.00),
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
