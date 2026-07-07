<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoefficientClasseMatiere;
use App\Models\Classe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoefficientClasseMatiereController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'classe_id' => 'required|integer',
        ]);

        $classeId = $request->query('classe_id');
        $tenantId = Auth::user()->etablissement_id;

        $classe = Classe::where('id', $classeId)->where('etablissement_id', $tenantId)->firstOrFail();
        $matieres = $classe->matieres;

        // Fetch class coefficients
        $coefficients = CoefficientClasseMatiere::where('classe_id', $classeId)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->keyBy('matiere_id');

        $data = $matieres->map(function ($matiere) use ($coefficients) {
            $coefOverride = $coefficients->get($matiere->id);

            return [
                'matiere_id' => $matiere->id,
                'nom' => $matiere->nom,
                'code' => $matiere->code,
                'coefficient_global' => (float)$matiere->coefficient,
                'coefficient_classe' => $coefOverride ? (float)$coefOverride->coefficient : null,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classe_id' => 'required|integer',
            'matiere_id' => 'required|integer',
            'coefficient' => 'required|numeric|min:0',
            'apply_to_level' => 'nullable|boolean', // "Appliquer à toutes les classes du même niveau"
        ]);

        $tenantId = Auth::user()->etablissement_id;

        $coefficient = CoefficientClasseMatiere::updateOrCreate(
            [
                'classe_id' => $validated['classe_id'],
                'matiere_id' => $validated['matiere_id'],
                'etablissement_id' => $tenantId,
            ],
            [
                'coefficient' => $validated['coefficient'],
            ]
        );

        if (!empty($validated['apply_to_level'])) {
            $currentClass = Classe::findOrFail($validated['classe_id']);
            $classesSameLevel = Classe::where('niveau', $currentClass->niveau)
                ->where('etablissement_id', $tenantId)
                ->get();

            foreach ($classesSameLevel as $cls) {
                CoefficientClasseMatiere::updateOrCreate(
                    [
                        'classe_id' => $cls->id,
                        'matiere_id' => $validated['matiere_id'],
                        'etablissement_id' => $tenantId,
                    ],
                    [
                        'coefficient' => $validated['coefficient'],
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Coefficient saved successfully.',
            'data' => $coefficient
        ], 200);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classe_id' => 'required|integer',
            'matiere_id' => 'required|integer',
        ]);

        $tenantId = Auth::user()->etablissement_id;

        CoefficientClasseMatiere::where('classe_id', $validated['classe_id'])
            ->where('matiere_id', $validated['matiere_id'])
            ->where('etablissement_id', $tenantId)
            ->delete();

        return response()->json([
            'message' => 'Coefficient deleted successfully.'
        ], 200);
    }
}
