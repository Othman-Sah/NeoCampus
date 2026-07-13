<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GradeDistributionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'subject' => $this['subject'] ?? '',
            'average_grade' => (float) ($this['average_grade'] ?? 0.0),
            'min_grade' => (float) ($this['min_grade'] ?? 0.0),
            'max_grade' => (float) ($this['max_grade'] ?? 0.0),
        ];
    }
}
