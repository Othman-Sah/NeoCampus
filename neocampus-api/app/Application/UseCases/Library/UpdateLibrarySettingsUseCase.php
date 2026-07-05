<?php

namespace App\Application\UseCases\Library;

use Illuminate\Support\Facades\DB;

class UpdateLibrarySettingsUseCase
{
    public function execute(int $tenantId, array $settings): void
    {
        DB::transaction(function () use ($tenantId, $settings) {
            foreach ($settings as $key => $value) {
                // Ensure it's one of the valid settings
                if (in_array($key, ['loan_duration_days', 'max_loans_per_member', 'fine_per_day_mad'])) {
                    DB::table('library_settings')->updateOrInsert(
                        ['etablissement_id' => $tenantId, 'key' => $key],
                        ['value' => json_encode($value), 'updated_at' => now()]
                    );
                }
            }
        });
    }
}
