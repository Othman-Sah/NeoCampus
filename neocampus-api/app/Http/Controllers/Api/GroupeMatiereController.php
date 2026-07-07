<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GroupeMatiere;
use App\Models\Matiere;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupeMatiereController extends Controller
{
    public function index(): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $groups = GroupeMatiere::with('matieres')
            ->where('etablissement_id', $tenantId)
            ->orderBy('ordre')
            ->get();
        return response()->json(['data' => $groups]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'ordre' => 'required|integer|min:0',
            'matiere_ids' => 'nullable|array',
            'matiere_ids.*' => 'integer|exists:matieres,id',
        ]);

        $tenantId = Auth::user()->etablissement_id;

        $group = GroupeMatiere::create([
            'nom' => $validated['nom'],
            'ordre' => $validated['ordre'],
            'etablissement_id' => $tenantId,
        ]);

        if (!empty($validated['matiere_ids'])) {
            Matiere::whereIn('id', $validated['matiere_ids'])
                ->where('etablissement_id', $tenantId)
                ->update(['groupe_matiere_id' => $group->id]);
        }

        return response()->json([
            'message' => 'Subject group created successfully.',
            'data' => $group->load('matieres')
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $group = GroupeMatiere::where('id', $id)->where('etablissement_id', $tenantId)->firstOrFail();

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'ordre' => 'required|integer|min:0',
            'matiere_ids' => 'nullable|array',
            'matiere_ids.*' => 'integer|exists:matieres,id',
        ]);

        $group->update([
            'nom' => $validated['nom'],
            'ordre' => $validated['ordre'],
        ]);

        // Dissociate old matieres first
        Matiere::where('groupe_matiere_id', $group->id)
            ->where('etablissement_id', $tenantId)
            ->update(['groupe_matiere_id' => null]);

        // Associate new matieres
        if (!empty($validated['matiere_ids'])) {
            Matiere::whereIn('id', $validated['matiere_ids'])
                ->where('etablissement_id', $tenantId)
                ->update(['groupe_matiere_id' => $group->id]);
        }

        return response()->json([
            'message' => 'Subject group updated successfully.',
            'data' => $group->load('matieres')
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenantId = Auth::user()->etablissement_id;
        $group = GroupeMatiere::where('id', $id)->where('etablissement_id', $tenantId)->firstOrFail();

        // Dissociate matieres first
        Matiere::where('groupe_matiere_id', $group->id)
            ->where('etablissement_id', $tenantId)
            ->update(['groupe_matiere_id' => null]);

        $group->delete();

        return response()->json([
            'message' => 'Subject group deleted successfully.'
        ], 200);
    }
}
