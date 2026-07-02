<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'seance_id' => 'required|integer|exists:seances,id',
            'date' => 'required|date_format:Y-m-d',
            'presences' => 'required|array',
            'presences.*.eleve_id' => 'required|integer|exists:eleves,id',
            'presences.*.statut' => 'required|string|in:present,absent,retard',
            'presences.*.motif' => 'nullable|string',
        ];
    }
}
