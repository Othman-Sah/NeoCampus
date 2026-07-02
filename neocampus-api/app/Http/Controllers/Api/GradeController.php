<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkGradesRequest;
use App\Http\Requests\RequestNoteExceptionRequest;
use App\Http\Resources\NoteResource;
use App\Http\Resources\DemandeExceptionNoteResource;
use App\Application\DTOs\BulkGradesDTO;
use App\Application\DTOs\RequestNoteExceptionDTO;
use App\Application\UseCases\SubmitBulkGradesUseCase;
use App\Application\UseCases\RequestNoteExceptionUseCase;
use App\Application\UseCases\ApproveNoteExceptionUseCase;
use App\Domain\Ports\GradePortInterface;
use App\Domain\Ports\ExamenPortInterface;
use App\Models\Enseignant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * @OA\Tag(name="Grades", description="Endpoints for student grades entry and strict windows management")
 */
class GradeController extends Controller
{
    private SubmitBulkGradesUseCase $submitBulkGradesUseCase;
    private RequestNoteExceptionUseCase $requestExceptionUseCase;
    private ApproveNoteExceptionUseCase $approveExceptionUseCase;
    private GradePortInterface $gradeRepository;
    private ExamenPortInterface $examenRepository;

    public function __construct(
        SubmitBulkGradesUseCase $submitBulkGradesUseCase,
        RequestNoteExceptionUseCase $requestExceptionUseCase,
        ApproveNoteExceptionUseCase $approveExceptionUseCase,
        GradePortInterface $gradeRepository,
        ExamenPortInterface $examenRepository
    ) {
        $this->submitBulkGradesUseCase = $submitBulkGradesUseCase;
        $this->requestExceptionUseCase = $requestExceptionUseCase;
        $this->approveExceptionUseCase = $approveExceptionUseCase;
        $this->gradeRepository = $gradeRepository;
        $this->examenRepository = $examenRepository;
    }

    /**
     * @OA\Post(
     *     path="/api/notes/bulk",
     *     summary="Submit bulk grades for an exam",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"examen_id", "notes"},
     *             @OA\Property(property="examen_id", type="integer"),
     *             @OA\Property(
     *                 property="notes",
     *                 type="array",
     *                 @OA\Items(
     *                     required={"eleve_id", "valeur"},
     *                     @OA\Property(property="eleve_id", type="integer"),
     *                     @OA\Property(property="valeur", type="number", format="float")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Grades registered successfully"),
     *     @OA\Response(response=403, description="Outside grading window")
     * )
     */
    public function submitBulk(BulkGradesRequest $request): JsonResponse
    {
        $dto = BulkGradesDTO::fromArray($request->validated());
        $results = $this->submitBulkGradesUseCase->execute($dto, $request->user()->id);

        return response()->json([
            'message' => 'Notes enregistrées avec succès.',
            'data' => NoteResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/notes/exceptions/request",
     *     summary="Teacher requests exception to edit grades past deadline",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"examen_id", "motif"},
     *             @OA\Property(property="examen_id", type="integer"),
     *             @OA\Property(property="motif", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Exception request submitted")
     * )
     */
    public function requestException(RequestNoteExceptionRequest $request): JsonResponse
    {
        $dto = RequestNoteExceptionDTO::fromArray($request->validated());
        $result = $this->requestExceptionUseCase->execute($dto, $request->user()->id);

        return response()->json([
            'message' => 'Demande d\'exception soumise avec succès.',
            'data' => new DemandeExceptionNoteResource($result)
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/notes/exceptions/{id}/approve",
     *     summary="Admin approves grade edit exception",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Exception approved")
     * )
     */
    public function approveException(int $id, Request $request): JsonResponse
    {
        $result = $this->approveExceptionUseCase->execute($id, $request->user()->id);

        return response()->json([
            'message' => 'Demande d\'exception approuvée avec succès.',
            'data' => new DemandeExceptionNoteResource($result)
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/notes/check-window/{examenId}",
     *     summary="Verify if grading is currently allowed",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="examenId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Grading window status")
     * )
     */
    public function checkWindow(int $examenId, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            return response()->json([
                'within_window' => true,
                'exception_granted' => false,
                'can_enter_grades' => true,
            ]);
        }

        $teacher = Enseignant::where('user_id', $user->id)->first();
        if (!$teacher) {
            return response()->json([
                'within_window' => false,
                'exception_granted' => false,
                'can_enter_grades' => false,
            ]);
        }

        $settings = $this->examenRepository->findSettings();
        $now = now();
        $withinWindow = false;

        if ($settings) {
            $start = \Carbon\Carbon::parse($settings['periode_saisie_notes_debut']);
            $end = \Carbon\Carbon::parse($settings['periode_saisie_notes_fin']);
            $withinWindow = $now->between($start, $end);
        }

        $hasException = $this->gradeRepository->hasActiveException($teacher->id, $examenId);

        return response()->json([
            'within_window' => $withinWindow,
            'exception_granted' => $hasException,
            'can_enter_grades' => $withinWindow || $hasException,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/notes/exceptions/pending",
     *     summary="Get pending exception requests (Admin only)",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="List of pending exceptions")
     * )
     */
    public function pendingExceptions(): JsonResponse
    {
        $results = $this->gradeRepository->getPendingExceptions();

        return response()->json([
            'data' => DemandeExceptionNoteResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/notes/examen/{examenId}",
     *     summary="Get notes entered for an exam",
     *     tags={"Grades"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="examenId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="List of exam grades")
     * )
     */
    public function findByExamen(int $examenId): JsonResponse
    {
        $results = $this->gradeRepository->findByExamen($examenId);

        return response()->json([
            'data' => NoteResource::collection(collect($results))
        ], 200);
    }
}
