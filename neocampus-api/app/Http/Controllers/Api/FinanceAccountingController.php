<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecetteDepenseRequest;
use App\Http\Resources\RecetteDepenseResource;
use App\Application\DTOs\CreateRecetteDepenseDTO;
use App\Application\UseCases\ManageRecettesDepensesUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * @OA\Tag(
 *     name="Finance Accounting",
 *     description="Endpoints for internal accounting (receipts and expenses)"
 * )
 */
class FinanceAccountingController extends Controller
{
    private ManageRecettesDepensesUseCase $useCase;

    public function __construct(ManageRecettesDepensesUseCase $useCase)
    {
        $this->useCase = $useCase;
    }

    /**
     * @OA\Get(
     *     path="/api/finance/accounting",
     *     summary="List all accounting entries with filters",
     *     tags={"Finance Accounting"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"recette","depense"})),
     *     @OA\Parameter(name="date_from", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_to", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="categorie", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/RecetteDepense"))
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['type', 'date_from', 'date_to', 'categorie']);
        $entries = $this->useCase->list($filters);
        return response()->json(['data' => RecetteDepenseResource::collection($entries)]);
    }

    /**
     * @OA\Post(
     *     path="/api/finance/accounting",
     *     summary="Create a new accounting entry",
     *     tags={"Finance Accounting"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"libelle", "montant", "type", "date"}, @OA\Property(property="libelle", type="string"), @OA\Property(property="montant", type="number"), @OA\Property(property="type", type="string", enum={"recette","depense"}), @OA\Property(property="categorie", type="string"), @OA\Property(property="date", type="string"), @OA\Property(property="justificatif", type="string"))
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(ref="#/components/schemas/RecetteDepense")
     *     )
     * )
     */
    public function store(RecetteDepenseRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\RecetteDepense::class);
        $dto = CreateRecetteDepenseDTO::fromRequest($request->validated());
        $entry = $this->useCase->create($dto);
        return (new RecetteDepenseResource($entry))->response()->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/api/finance/accounting/{id}",
     *     summary="Update an existing accounting entry",
     *     tags={"Finance Accounting"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"libelle", "montant", "type", "date"}, @OA\Property(property="libelle", type="string"), @OA\Property(property="montant", type="number"), @OA\Property(property="type", type="string", enum={"recette","depense"}), @OA\Property(property="categorie", type="string"), @OA\Property(property="date", type="string"), @OA\Property(property="justificatif", type="string"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(ref="#/components/schemas/RecetteDepense")
     *     )
     * )
     */
    public function update(RecetteDepenseRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', \App\Models\RecetteDepense::class);
        $dto = CreateRecetteDepenseDTO::fromRequest($request->validated());
        $entry = $this->useCase->update($id, $dto);
        return response()->json(['data' => new RecetteDepenseResource($entry)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/finance/accounting/{id}",
     *     summary="Delete an accounting entry",
     *     tags={"Finance Accounting"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Deleted successfully"),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $this->authorize('delete', \App\Models\RecetteDepense::class);
        $deleted = $this->useCase->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Accounting entry not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Accounting entry deleted successfully.'], Response::HTTP_OK);
    }
}
