<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateBulletinRequest;
use App\Http\Resources\BulletinResource;
use App\Application\DTOs\GenerateBulletinDTO;
use App\Application\UseCases\GenerateBulletinsUseCase;
use Illuminate\Http\JsonResponse;

/**
 * @OA\Tag(name="Bulletins", description="Endpoints for student reports/bulletins")
 */
class BulletinController extends Controller
{
    private GenerateBulletinsUseCase $generateBulletinsUseCase;

    public function __construct(GenerateBulletinsUseCase $generateBulletinsUseCase)
    {
        $this->generateBulletinsUseCase = $generateBulletinsUseCase;
    }

    /**
     * @OA\Post(
     *     path="/api/bulletins/generate",
     *     summary="Bulk generate bulletins for a class and period",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"classe_id", "periode"},
     *             @OA\Property(property="classe_id", type="integer"),
     *             @OA\Property(property="periode", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bulletins generated successfully")
     * )
     */
    public function generate(GenerateBulletinRequest $request): JsonResponse
    {
        $dto = GenerateBulletinDTO::fromArray($request->validated());
        $results = $this->generateBulletinsUseCase->execute($dto);

        return response()->json([
            'message' => 'Bulletins de notes générés avec succès.',
            'data' => BulletinResource::collection(collect($results))
        ], 200);
    }
}
