<?php

namespace App\Application\Services;

use Illuminate\Support\Facades\DB;

class EstablishmentBootstrapper
{
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
}
