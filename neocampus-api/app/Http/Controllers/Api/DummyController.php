<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DummyController extends Controller
{
    #[OA\Get(
        path: "/admin/eleves",
        summary: "Get list of students (Dummy)",
        responses: [
            new OA\Response(response: 200, description: "Success")
        ]
    )]
    public function index(): JsonResponse
    {
        return response()->json(['message' => 'Index placeholder']);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Store placeholder']);
    }

    public function show(string $id): JsonResponse
    {
        return response()->json(['message' => 'Show placeholder', 'id' => $id]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json(['message' => 'Update placeholder', 'id' => $id]);
    }

    public function destroy(string $id): JsonResponse
    {
        return response()->json(['message' => 'Destroy placeholder', 'id' => $id]);
    }
}
