<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordPaymentRequest;
use App\Http\Resources\PaiementResource;
use App\Http\Resources\FraisResource;
use App\Http\Resources\SoldeResource;
use App\Application\DTOs\RecordPaymentDTO;
use App\Application\UseCases\RecordPaymentUseCase;
use App\Application\UseCases\GetStudentBalanceUseCase;
use App\Domain\Ports\FinancePaymentPortInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * @OA\Tag(
 *     name="Finance Payments",
 *     description="Endpoints for recording payments and checking student balances"
 * )
 */
class FinancePaymentController extends Controller
{
    private RecordPaymentUseCase $recordUseCase;
    private GetStudentBalanceUseCase $balanceUseCase;
    private FinancePaymentPortInterface $paymentPort;

    public function __construct(
        RecordPaymentUseCase $recordUseCase,
        GetStudentBalanceUseCase $balanceUseCase,
        FinancePaymentPortInterface $paymentPort
    ) {
        $this->recordUseCase = $recordUseCase;
        $this->balanceUseCase = $balanceUseCase;
        $this->paymentPort = $paymentPort;
    }

    /**
     * @OA\Post(
     *     path="/api/finance/payments",
     *     summary="Record a payment for a student fee",
     *     tags={"Finance Payments"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(required={"frais_id", "montant_paye", "date_paiement", "mode"}, @OA\Property(property="frais_id", type="integer"), @OA\Property(property="montant_paye", type="number"), @OA\Property(property="date_paiement", type="string"), @OA\Property(property="mode", type="string", enum={"cash","virement","cheque"}), @OA\Property(property="reference", type="string"))
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Recorded successfully",
     *         @OA\JsonContent(ref="#/components/schemas/Paiement")
     *     ),
     *     @OA\Response(response=422, description="Validation error"),
     *     @OA\Response(response=400, description="Business logic error")
     * )
     */
    public function store(RecordPaymentRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\Paiement::class);
        $dto = RecordPaymentDTO::fromRequest($request->validated());
        $payment = $this->recordUseCase->execute($dto);
        
        return (new PaiementResource($payment))
            ->additional(['message' => __('finance.payment_recorded')])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/payments",
     *     summary="List payments with filters",
     *     tags={"Finance Payments"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="date_from", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_to", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="mode", in="query", required=false, @OA\Schema(type="string", enum={"cash","virement","cheque"})),
     *     @OA\Parameter(name="eleve_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/Paiement"))
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'mode', 'eleve_id']);
        $payments = $this->paymentPort->findAll($filters);
        return response()->json(['data' => PaiementResource::collection($payments)]);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/students/{id}/balance",
     *     summary="Get student balance ledger and full fee history",
     *     tags={"Finance Payments"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(
     *             @OA\Property(property="student", type="object"),
     *             @OA\Property(property="fees", type="array", @OA\Items(ref="#/components/schemas/Frais")),
     *             @OA\Property(property="solde", ref="#/components/schemas/Solde")
     *         )
     *     ),
     *     @OA\Response(response=404, description="Not Found")
     * )
     */
    public function studentBalance(int $id): JsonResponse
    {
        $balance = $this->balanceUseCase->execute($id);
        
        $hasLate = false;
        foreach ($balance['fees'] as $f) {
            if ($f['statut'] === 'en_retard') {
                $hasLate = true;
                break;
            }
        }
        $balance['solde']['has_late_fees'] = $hasLate;

        return response()->json([
            'data' => [
                'student' => $balance['student'],
                'fees' => FraisResource::collection($balance['fees']),
                'solde' => new SoldeResource($balance['solde']),
            ]
        ]);
    }
}
