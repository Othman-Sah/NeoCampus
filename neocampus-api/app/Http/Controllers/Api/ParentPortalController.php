<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\ParentPortal\GetParentChildrenUseCase;
use App\Application\UseCases\ParentPortal\GetChildGradesUseCase;
use App\Application\UseCases\ParentPortal\GetChildAttendanceUseCase;
use App\Application\UseCases\ParentPortal\GetChildTimetableUseCase;
use App\Application\UseCases\ParentPortal\GetChildBalanceUseCase;
use App\Application\UseCases\ParentPortal\GetChildBulletinsUseCase;
use App\Http\Resources\ChildSummaryResource;
use App\Http\Resources\ChildGradeResource;
use App\Http\Resources\ChildAttendanceResource;
use App\Http\Resources\SeanceResource;
use App\Http\Resources\SoldeResource;
use App\Http\Resources\FraisResource;
use App\Http\Resources\PaiementResource;
use App\Http\Resources\BulletinResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParentPortalController extends Controller
{
    private GetParentChildrenUseCase $getParentChildrenUseCase;
    private GetChildGradesUseCase $getChildGradesUseCase;
    private GetChildAttendanceUseCase $getChildAttendanceUseCase;
    private GetChildTimetableUseCase $getChildTimetableUseCase;
    private GetChildBalanceUseCase $getChildBalanceUseCase;
    private GetChildBulletinsUseCase $getChildBulletinsUseCase;

    public function __construct(
        GetParentChildrenUseCase $getParentChildrenUseCase,
        GetChildGradesUseCase $getChildGradesUseCase,
        GetChildAttendanceUseCase $getChildAttendanceUseCase,
        GetChildTimetableUseCase $getChildTimetableUseCase,
        GetChildBalanceUseCase $getChildBalanceUseCase,
        GetChildBulletinsUseCase $getChildBulletinsUseCase
    ) {
        $this->getParentChildrenUseCase = $getParentChildrenUseCase;
        $this->getChildGradesUseCase = $getChildGradesUseCase;
        $this->getChildAttendanceUseCase = $getChildAttendanceUseCase;
        $this->getChildTimetableUseCase = $getChildTimetableUseCase;
        $this->getChildBalanceUseCase = $getChildBalanceUseCase;
        $this->getChildBulletinsUseCase = $getChildBulletinsUseCase;
    }

    public function children(Request $request): JsonResponse
    {
        $parentId = $request->user()->id;
        $results = $this->getParentChildrenUseCase->execute($parentId);

        return response()->json([
            'data' => ChildSummaryResource::collection($results)
        ], 200);
    }

    public function childGrades(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $results = $this->getChildGradesUseCase->execute($parentId, $id);

        return response()->json([
            'data' => ChildGradeResource::collection($results)
        ], 200);
    }

    public function childAttendance(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        $results = $this->getChildAttendanceUseCase->execute($parentId, $id, $startDate, $endDate);

        return response()->json([
            'data' => ChildAttendanceResource::collection($results)
        ], 200);
    }

    public function childTimetable(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $results = $this->getChildTimetableUseCase->execute($parentId, $id);

        return response()->json([
            'data' => SeanceResource::collection($results)
        ], 200);
    }

    public function childBalance(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $results = $this->getChildBalanceUseCase->execute($parentId, $id);

        return response()->json([
            'data' => [
                'solde' => $results['solde'] ? new SoldeResource($results['solde']) : null,
                'frais' => FraisResource::collection($results['frais']),
                'recent_payments' => PaiementResource::collection($results['recent_payments']),
            ]
        ], 200);
    }

    public function childBulletins(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $results = $this->getChildBulletinsUseCase->execute($parentId, $id);

        return response()->json([
            'data' => BulletinResource::collection($results)
        ], 200);
    }

    public function childLoans(Request $request, int $id): JsonResponse
    {
        $parentId = $request->user()->id;
        $hasLink = \App\Models\ParentEleve::where('parent_user_id', $parentId)
            ->where('eleve_id', $id)
            ->exists();

        if (!$hasLink) {
            return response()->json(['message' => 'Forbidden: You are not authorized to view this student.'], 403);
        }

        $child = \App\Models\Eleve::findOrFail($id);
        
        $emprunts = collect();
        if ($child->user_id) {
            $adherent = \App\Models\Adherent::where('user_id', $child->user_id)->first();
            if ($adherent) {
                $emprunts = \App\Models\Emprunt::with('livre')
                    ->where('adherent_id', $adherent->id)
                    ->orderBy('date_emprunt', 'desc')
                    ->get();
            }
        }

        return response()->json([
            'data' => $emprunts->map(function ($e) {
                return [
                    'id' => $e->id,
                    'book_title' => $e->livre->titre ?? 'N/A',
                    'book_author' => $e->livre->auteur ?? 'N/A',
                    'book_isbn' => $e->livre->isbn ?? 'N/A',
                    'date_emprunt' => $e->date_emprunt ? $e->date_emprunt->toDateString() : '',
                    'date_retour_prevue' => $e->date_retour_prevue ? $e->date_retour_prevue->toDateString() : '',
                    'date_retour_effective' => $e->date_retour_effective ? $e->date_retour_effective->toDateString() : null,
                    'statut' => $e->statut,
                ];
            })
        ], 200);
    }
}
