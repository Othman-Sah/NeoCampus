<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BulletinConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BulletinConfigController extends Controller
{
    public function show(): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $config = BulletinConfig::firstOrCreate(
            ['etablissement_id' => $tenantId],
            [
                'format_periode' => 'trimestre',
                'seuil_encouragements' => 12.0,
                'seuil_tableau_honneur' => 14.0,
                'seuil_felicitations' => 16.0,
                'show_min_max' => true,
                'show_rang_matiere' => true,
                'show_detail_notes' => false,
                'show_sous_total_groupe' => true,
                'note_eliminatoire' => null,
            ]
        );

        return response()->json(['data' => $config]);
    }

    public function update(Request $request): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $config = BulletinConfig::where('etablissement_id', $tenantId)->firstOrFail();

        $validated = $request->validate([
            'format_periode' => 'required|string|in:trimestre,semestre',
            'seuil_encouragements' => 'required|numeric|min:0|max:20',
            'seuil_tableau_honneur' => 'required|numeric|min:0|max:20',
            'seuil_felicitations' => 'required|numeric|min:0|max:20',
            'show_min_max' => 'required|boolean',
            'show_rang_matiere' => 'required|boolean',
            'show_detail_notes' => 'required|boolean',
            'show_sous_total_groupe' => 'required|boolean',
            'note_eliminatoire' => 'nullable|numeric|min:0|max:20',
        ]);

        $config->update($validated);

        return response()->json([
            'message' => 'Configuration updated successfully.',
            'data' => $config
        ]);
    }
}
