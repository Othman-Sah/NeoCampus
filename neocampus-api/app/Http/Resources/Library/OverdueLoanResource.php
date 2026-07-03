<?php

namespace App\Http\Resources\Library;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OverdueLoanResource extends LoanResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $res = parent::toArray($request);
        $data = is_array($this->resource) ? $this->resource : $this->resource->toArray();

        // 1. Calculate days overdue (jours_retard)
        $dateRetourPrevue = Carbon::parse($data['date_retour_prevue'])->startOfDay();
        $dateEffective = isset($data['date_retour_effective']) ? Carbon::parse($data['date_retour_effective'])->startOfDay() : now()->startOfDay();

        $joursRetard = 0;
        if ($dateEffective->greaterThan($dateRetourPrevue)) {
            $joursRetard = $dateEffective->diffInDays($dateRetourPrevue);
        }

        // 2. Fetch tenant specific fine_per_day_mad setting
        $tenantId = auth()->user()->etablissement_id;
        $fineSetting = DB::table('library_settings')
            ->where('etablissement_id', $tenantId)
            ->where('key', 'fine_per_day_mad')
            ->first();
        $finePerDay = $fineSetting ? json_decode($fineSetting->value, true) : 2;

        // 3. Compute fine
        $amende = $joursRetard * $finePerDay;

        $res['jours_retard'] = $joursRetard;
        $res['amende'] = $amende;

        return $res;
    }
}
