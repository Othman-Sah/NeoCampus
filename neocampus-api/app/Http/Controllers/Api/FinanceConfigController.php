<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GroupeFraisRequest;
use App\Http\Requests\TypeFraisRequest;
use App\Http\Resources\GroupeFraisResource;
use App\Http\Resources\TypeFraisResource;
use App\Application\DTOs\CreateGroupeFraisDTO;
use App\Application\DTOs\CreateTypeFraisDTO;
use App\Application\UseCases\ManageGroupeFraisUseCase;
use App\Application\UseCases\ManageTypeFraisUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * @OA\Tag(
 *     name="Finance Configuration",
 *     description="Endpoints for configuring fee groups and fee types"
 * )
 */
class FinanceConfigController extends Controller
{
    private ManageGroupeFraisUseCase $groupeUseCase;
    private ManageTypeFraisUseCase $typeUseCase;

    public function __construct(
        ManageGroupeFraisUseCase $groupeUseCase,
        ManageTypeFraisUseCase $typeUseCase
    ) {
        $this->groupeUseCase = $groupeUseCase;
        $this->typeUseCase = $typeUseCase;
    }

    /**
     * @OA\Get(
     *     path="/api/finance/groups",
     *     summary="List all fee groups",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/GroupeFrais"))
     *     )
     * )
     */
    public function listGroups(): JsonResponse
    {
        $groups = $this->groupeUseCase->list();
        return response()->json(['data' => GroupeFraisResource::collection($groups)]);
    }

    /**
     * @OA\Post(
     *     path="/api/finance/groups",
     *     summary="Create a new fee group",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"nom"}, @OA\Property(property="nom", type="string"), @OA\Property(property="description", type="string"))
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(ref="#/components/schemas/GroupeFrais")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function storeGroup(GroupeFraisRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\GroupeFrais::class);
        $dto = CreateGroupeFraisDTO::fromRequest($request->validated());
        $group = $this->groupeUseCase->create($dto);
        return (new GroupeFraisResource($group))->response()->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/api/finance/groups/{id}",
     *     summary="Update a fee group",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"nom"}, @OA\Property(property="nom", type="string"), @OA\Property(property="description", type="string"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated",
     *         @OA\JsonContent(ref="#/components/schemas/GroupeFrais")
     *     ),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function updateGroup(GroupeFraisRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', \App\Models\GroupeFrais::class);
        $dto = CreateGroupeFraisDTO::fromRequest($request->validated());
        $group = $this->groupeUseCase->update($id, $dto);
        return response()->json(['data' => new GroupeFraisResource($group)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/finance/groups/{id}",
     *     summary="Delete a fee group",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Deleted successfully"),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function destroyGroup(int $id): JsonResponse
    {
        $this->authorize('delete', \App\Models\GroupeFrais::class);
        $deleted = $this->groupeUseCase->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Group not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Group deleted successfully.'], Response::HTTP_OK);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/types",
     *     summary="List all fee types",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="groupe_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/TypeFrais"))
     *     )
     * )
     */
    public function listTypes(Request $request): JsonResponse
    {
        $filters = $request->only(['groupe_id']);
        $types = $this->typeUseCase->list($filters);
        return response()->json(['data' => TypeFraisResource::collection($types)]);
    }

    /**
     * @OA\Post(
     *     path="/api/finance/types",
     *     summary="Create a new fee type",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"libelle", "groupe_frais_id"}, @OA\Property(property="libelle", type="string"), @OA\Property(property="groupe_frais_id", type="integer"), @OA\Property(property="montant_par_defaut", type="number"))
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Created",
     *         @OA\JsonContent(ref="#/components/schemas/TypeFrais")
     *     )
     * )
     */
    public function storeType(TypeFraisRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\TypeFrais::class);
        $dto = CreateTypeFraisDTO::fromRequest($request->validated());
        $type = $this->typeUseCase->create($dto);
        return (new TypeFraisResource($type))->response()->setStatusCode(201);
    }

    /**
     * @OA\Put(
     *     path="/api/finance/types/{id}",
     *     summary="Update a fee type",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"libelle", "groupe_frais_id"}, @OA\Property(property="libelle", type="string"), @OA\Property(property="groupe_frais_id", type="integer"), @OA\Property(property="montant_par_defaut", type="number"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Updated",
     *         @OA\JsonContent(ref="#/components/schemas/TypeFrais")
     *     )
     * )
     */
    public function updateType(TypeFraisRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', \App\Models\TypeFrais::class);
        $dto = CreateTypeFraisDTO::fromRequest($request->validated());
        $type = $this->typeUseCase->update($id, $dto);
        return response()->json(['data' => new TypeFraisResource($type)]);
    }

    /**
     * @OA\Delete(
     *     path="/api/finance/types/{id}",
     *     summary="Delete a fee type",
     *     tags={"Finance Configuration"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Deleted successfully"),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function destroyType(int $id): JsonResponse
    {
        $this->authorize('delete', \App\Models\TypeFrais::class);
        $deleted = $this->typeUseCase->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Type not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Type deleted successfully.'], Response::HTTP_OK);
    }
}
