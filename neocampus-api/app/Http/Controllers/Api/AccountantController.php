<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AccountantController extends Controller
{
    /**
     * Display a listing of accountants.
     */
    public function index(): JsonResponse
    {
        $etabId = Auth::user()->etablissement_id;
        $accountants = User::where('etablissement_id', $etabId)
            ->where('role', 'comptable')
            ->get();

        return response()->json(['data' => $accountants]);
    }

    /**
     * Store a newly created accountant.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $etabId = Auth::user()->etablissement_id;

        $user = User::create([
            'etablissement_id' => $etabId,
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'comptable',
        ]);

        return response()->json(['data' => $user], Response::HTTP_CREATED);
    }

    /**
     * Display the specified accountant.
     */
    public function show(int $id): JsonResponse
    {
        $etabId = Auth::user()->etablissement_id;
        $user = User::where('etablissement_id', $etabId)
            ->where('role', 'comptable')
            ->findOrFail($id);

        return response()->json(['data' => $user]);
    }

    /**
     * Update the specified accountant.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $etabId = Auth::user()->etablissement_id;
        $user = User::where('etablissement_id', $etabId)
            ->where('role', 'comptable')
            ->findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = $request->only(['nom', 'prenom', 'email']);
        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json(['data' => $user]);
    }

    /**
     * Remove the specified accountant.
     */
    public function destroy(int $id): JsonResponse
    {
        $etabId = Auth::user()->etablissement_id;
        $user = User::where('etablissement_id', $etabId)
            ->where('role', 'comptable')
            ->findOrFail($id);

        $user->delete();

        return response()->json(['message' => 'Accountant deleted successfully.']);
    }
}
