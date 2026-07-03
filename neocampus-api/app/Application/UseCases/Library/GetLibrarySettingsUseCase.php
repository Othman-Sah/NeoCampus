<?php

namespace App\Application\UseCases\Library;

use Illuminate\Support\Facades\DB;

class GetLibrarySettingsUseCase
{
    public function execute(int $tenantId): array
    {
        $settings = DB::table('library_settings')
            ->where('etablissement_id', $tenantId)
            ->pluck('value', 'key')
            ->map(function ($value) {
                return json_decode($value, true);
            })
            ->toArray();

        $defaults = [
            'loan_duration_days' => 14,
            'max_loans_per_member' => 5,
            'fine_per_day_mad' => 2
        ];

        return array_merge($defaults, $settings);
    }
}
