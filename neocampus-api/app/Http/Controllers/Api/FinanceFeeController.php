<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignFeeRequest;
use App\Http\Requests\ApplyRemiseRequest;
use App\Http\Requests\ApplyPenaliteRequest;
use App\Http\Resources\FraisResource;
use App\Application\DTOs\AssignFeeDTO;
use App\Application\DTOs\ApplyRemiseDTO;
use App\Application\DTOs\ApplyPenaliteDTO;
use App\Application\UseCases\AssignFeesToStudentUseCase;
use App\Application\UseCases\ApplyRemiseUseCase;
use App\Application\UseCases\ApplyPenaliteUseCase;
use App\Domain\Ports\FinanceFeePortInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * @OA\Tag(
 *     name="Finance Fees",
 *     description="Endpoints for managing and assigning student fees, remises, and penalites"
 * )
 */
class FinanceFeeController extends Controller
{
    private AssignFeesToStudentUseCase $assignUseCase;
    private ApplyRemiseUseCase $remiseUseCase;
    private ApplyPenaliteUseCase $penaliteUseCase;
    private FinanceFeePortInterface $feePort;

    public function __construct(
        AssignFeesToStudentUseCase $assignUseCase,
        ApplyRemiseUseCase $remiseUseCase,
        ApplyPenaliteUseCase $penaliteUseCase,
        FinanceFeePortInterface $feePort
    ) {
        $this->assignUseCase = $assignUseCase;
        $this->remiseUseCase = $remiseUseCase;
        $this->penaliteUseCase = $penaliteUseCase;
        $this->feePort = $feePort;
    }

    /**
     * @OA\Post(
     *     path="/api/finance/fees/assign",
     *     summary="Assign fee types to a student or a whole class",
     *     tags={"Finance Fees"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"type_frais_ids", "date_echeance"}, @OA\Property(property="type_frais_ids", type="array", @OA\Items(type="integer")), @OA\Property(property="eleve_id", type="integer"), @OA\Property(property="classe_id", type="integer"), @OA\Property(property="date_echeance", type="string"), @OA\Property(property="annee_scolaire", type="string"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Frais"))
     *     )
     * )
     */
    public function assign(AssignFeeRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\Frais::class);
        $dto = AssignFeeDTO::fromRequest($request->validated());
        $assigned = $this->assignUseCase->execute($dto);
        return response()->json([
            'message' => __('finance.fee_assigned'),
            'data' => FraisResource::collection($assigned)
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/fees",
     *     summary="List all fees with filters",
     *     tags={"Finance Fees"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="eleve_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="statut", in="query", required=false, @OA\Schema(type="string", enum={"en_attente","paye","en_retard"})),
     *     @OA\Parameter(name="annee_scolaire", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Frais"))
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['eleve_id', 'statut', 'annee_scolaire']);
        if ($request->has('annee')) {
            $filters['annee_scolaire'] = $request->input('annee');
        }
        $fees = $this->feePort->findAll($filters);
        return response()->json(['data' => FraisResource::collection($fees)]);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/fees/{id}",
     *     summary="Get single fee details",
     *     tags={"Finance Fees"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(ref="#/components/schemas/Frais")
     *     ),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $fee = $this->feePort->findById($id);
        if (!$fee) {
            return response()->json(['message' => 'Fee record not found.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['data' => new FraisResource($fee)]);
    }

    /**
     * @OA\Post(
     *     path="/api/finance/fees/{id}/remise",
     *     summary="Apply discount remise to a fee",
     *     tags={"Finance Fees"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"pourcentage"}, @OA\Property(property="pourcentage", type="number"), @OA\Property(property="motif", type="string"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(ref="#/components/schemas/Remise")
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function remise(ApplyRemiseRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', \App\Models\Frais::class);
        $input = $request->validated();
        $input['frais_id'] = $id;
        
        $dto = ApplyRemiseDTO::fromRequest($input);
        $remise = $this->remiseUseCase->execute($dto);
        
        return response()->json([
            'message' => __('finance.remise_applied'),
            'data' => $remise
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/finance/fees/{id}/penalite",
     *     summary="Apply late fee penalty to a fee",
     *     tags={"Finance Fees"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"montant"}, @OA\Property(property="montant", type="number"), @OA\Property(property="motif", type="string"))
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(ref="#/components/schemas/Penalite")
     *     )
     * )
     */
    public function penalite(ApplyPenaliteRequest $request, int $id): JsonResponse
    {
        $this->authorize('update', \App\Models\Frais::class);
        $input = $request->validated();
        $input['frais_id'] = $id;

        $dto = ApplyPenaliteDTO::fromRequest($input);
        $penalite = $this->penaliteUseCase->execute($dto);

        return response()->json([
            'message' => __('finance.penalite_applied'),
            'data' => $penalite
        ]);
    }
}
