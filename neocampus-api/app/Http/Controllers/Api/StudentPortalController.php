<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\StudentPortal\GetStudentDashboardUseCase;
use App\Application\UseCases\StudentPortal\GetStudentGradesUseCase;
use App\Application\UseCases\StudentPortal\GetStudentAttendanceUseCase;
use App\Application\UseCases\StudentPortal\GetStudentTimetableUseCase;
use App\Application\UseCases\StudentPortal\GetStudentSupportsUseCase;
use App\Application\UseCases\StudentPortal\GetStudentHomeworkUseCase;
use App\Http\Resources\StudentDashboardResource;
use App\Http\Resources\ChildGradeResource;
use App\Http\Resources\ChildAttendanceResource;
use App\Http\Resources\SeanceResource;
use App\Http\Resources\SupportResource;
use App\Http\Resources\DevoirResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentPortalController extends Controller
{
    private GetStudentDashboardUseCase $getStudentDashboardUseCase;
    private GetStudentGradesUseCase $getStudentGradesUseCase;
    private GetStudentAttendanceUseCase $getStudentAttendanceUseCase;
    private GetStudentTimetableUseCase $getStudentTimetableUseCase;
    private GetStudentSupportsUseCase $getStudentSupportsUseCase;
    private GetStudentHomeworkUseCase $getStudentHomeworkUseCase;

    public function __construct(
        GetStudentDashboardUseCase $getStudentDashboardUseCase,
        GetStudentGradesUseCase $getStudentGradesUseCase,
        GetStudentAttendanceUseCase $getStudentAttendanceUseCase,
        GetStudentTimetableUseCase $getStudentTimetableUseCase,
        GetStudentSupportsUseCase $getStudentSupportsUseCase,
        GetStudentHomeworkUseCase $getStudentHomeworkUseCase
    ) {
        $this->getStudentDashboardUseCase = $getStudentDashboardUseCase;
        $this->getStudentGradesUseCase = $getStudentGradesUseCase;
        $this->getStudentAttendanceUseCase = $getStudentAttendanceUseCase;
        $this->getStudentTimetableUseCase = $getStudentTimetableUseCase;
        $this->getStudentSupportsUseCase = $getStudentSupportsUseCase;
        $this->getStudentHomeworkUseCase = $getStudentHomeworkUseCase;
    }

    public function dashboard(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $result = $this->getStudentDashboardUseCase->execute($userId);

        return response()->json([
            'data' => new StudentDashboardResource($result)
        ], 200);
    }

    public function grades(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $results = $this->getStudentGradesUseCase->execute($userId);

        return response()->json([
            'data' => ChildGradeResource::collection($results)
        ], 200);
    }

    public function attendance(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        $results = $this->getStudentAttendanceUseCase->execute($userId, $startDate, $endDate);

        return response()->json([
            'data' => ChildAttendanceResource::collection($results)
        ], 200);
    }

    public function timetable(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $results = $this->getStudentTimetableUseCase->execute($userId);

        return response()->json([
            'data' => SeanceResource::collection($results)
        ], 200);
    }

    public function supports(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $results = $this->getStudentSupportsUseCase->execute($userId);

        return response()->json([
            'data' => SupportResource::collection($results)
        ], 200);
    }

    public function homework(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $results = $this->getStudentHomeworkUseCase->execute($userId);

        return response()->json([
            'data' => DevoirResource::collection($results)
        ], 200);
    }

    public function loans(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $adherent = \App\Models\Adherent::where('user_id', $userId)->first();
        
        $emprunts = collect();
        if ($adherent) {
            $emprunts = \App\Models\Emprunt::with('livre')
                ->where('adherent_id', $adherent->id)
                ->orderBy('date_emprunt', 'desc')
                ->get();
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
