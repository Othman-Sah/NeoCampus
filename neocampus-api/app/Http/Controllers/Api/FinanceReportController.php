<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FinanceSummaryResource;
use App\Application\UseCases\GetFinanceSummaryUseCase;
use App\Application\UseCases\GetTransactionLogUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * @OA\Tag(
 *     name="Finance Reports",
 *     description="Endpoints for financial summaries and transaction log export"
 * )
 */
class FinanceReportController extends Controller
{
    private GetFinanceSummaryUseCase $summaryUseCase;
    private GetTransactionLogUseCase $transactionsUseCase;

    public function __construct(
        GetFinanceSummaryUseCase $summaryUseCase,
        GetTransactionLogUseCase $transactionsUseCase
    ) {
        $this->summaryUseCase = $summaryUseCase;
        $this->transactionsUseCase = $transactionsUseCase;
    }

    /**
     * @OA\Get(
     *     path="/api/finance/reports/summary",
     *     summary="Get financial KPIs snapshot for a date range",
     *     tags={"Finance Reports"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="from", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="to", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(ref="#/components/schemas/FinanceSummary")
     *     )
     * )
     */
    public function summary(Request $request): JsonResponse
    {
        $filters = $request->only(['from', 'to']);
        // Also support 'mois' filter for salary calculation
        if ($request->has('from')) {
            $filters['mois'] = date('Y-m', strtotime($request->input('from')));
        }
        $summary = $this->summaryUseCase->execute($filters);
        return response()->json(['data' => new FinanceSummaryResource($summary)]);
    }

    /**
     * @OA\Get(
     *     path="/api/finance/reports/transactions",
     *     summary="Get transactional payment log with CSV export support",
     *     tags={"Finance Reports"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="from", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="to", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="mode", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="export", in="query", required=false, @OA\Schema(type="string", enum={"csv"})),
     *     @OA\Response(response=200, description="List of transactions or CSV file download")
     * )
     */
    public function transactions(Request $request): JsonResponse|StreamedResponse
    {
        $filters = $request->only(['from', 'to', 'mode', 'search']);
        $transactions = $this->transactionsUseCase->execute($filters);

        if ($request->input('export') === 'csv') {
            $csvExporter = function () use ($transactions) {
                $file = fopen('php://output', 'w');
                // UTF-8 BOM for French character support in Excel
                fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
                
                fputcsv($file, [
                    'Date',
                    'Eleve',
                    'Matricule',
                    'Type de Frais',
                    'Montant (MAD)',
                    'Mode de Paiement',
                    'Reference',
                    'Comptable'
                ], ';');

                foreach ($transactions as $tx) {
                    fputcsv($file, [
                        $tx['date_paiement'],
                        ($tx['eleve_prenom'] ?? '') . ' ' . ($tx['eleve_nom'] ?? ''),
                        $tx['eleve_matricule'] ?? '',
                        $tx['type_frais_libelle'] ?? '',
                        $tx['montant_paye'],
                        $tx['mode'] ?? '',
                        $tx['reference'] ?? '',
                        $tx['comptable_nom'] ?? ''
                    ], ';');
                }
                fclose($file);
            };

            return response()->streamDownload($csvExporter, 'transactions_export_' . date('Y-m-d') . '.csv', [
                'Content-Type' => 'text/csv; charset=UTF-8',
            ]);
        }

        return response()->json(['data' => $transactions]);
    }
}
