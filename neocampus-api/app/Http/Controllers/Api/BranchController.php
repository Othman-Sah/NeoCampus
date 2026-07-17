<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Succursale;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Display a listing of the branches.
     */
    public function index(Request $request)
    {
        // TenantScope automatically scopes Succursale by the authenticated user's etablissement_id
        $branches = Succursale::all();

        return response()->json($branches);
    }
}
