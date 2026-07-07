<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypeEvaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TypeEvaluationController extends Controller
{
    public function index(): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $types = TypeEvaluation::where('etablissement_id', $tenantId)->get();
        return response()->json(['data' => $types]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'code' => 'required|string|max:20',
            'poids_defaut' => 'required|numeric|min:0',
        ]);

        $tenantId = Auth::user()->etablissement_id;

        $type = TypeEvaluation::create(array_merge($validated, ['etablissement_id' => $tenantId]));

        return response()->json([
            'message' => 'Evaluation type created successfully.',
            'data' => $type
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $type = TypeEvaluation::where('id', $id)->where('etablissement_id', $tenantId)->firstOrFail();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'code' => 'required|string|max:20',
            'poids_defaut' => 'required|numeric|min:0',
        ]);

        $type->update($validated);

        return response()->json([
            'message' => 'Evaluation type updated successfully.',
            'data' => $type
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $type = TypeEvaluation::where('id', $id)->where('etablissement_id', $tenantId)->firstOrFail();
        $type->delete();

        return response()->json([
            'message' => 'Evaluation type deleted successfully.'
        ], 200);
    }
}
