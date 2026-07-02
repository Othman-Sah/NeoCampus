<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkAttendanceRequest;
use App\Http\Resources\PresenceResource;
use App\Application\DTOs\BulkAttendanceDTO;
use App\Application\UseCases\SubmitBulkAttendanceUseCase;
use App\Application\UseCases\GetClassPresencesUseCase;
use App\Application\UseCases\GetStudentPresencesUseCase;
use App\Application\UseCases\ListPresencesUseCase;
use App\Application\UseCases\UpdatePresenceStatusUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Attendance", description="Endpoints for student attendance management")
 */
class PresenceController extends Controller
{
    private SubmitBulkAttendanceUseCase $submitBulkUseCase;
    private GetClassPresencesUseCase $getClassPresencesUseCase;
    private GetStudentPresencesUseCase $getStudentPresencesUseCase;
    private ListPresencesUseCase $listPresencesUseCase;
    private UpdatePresenceStatusUseCase $updatePresenceStatusUseCase;

    public function __construct(
        SubmitBulkAttendanceUseCase $submitBulkUseCase,
        GetClassPresencesUseCase $getClassPresencesUseCase,
        GetStudentPresencesUseCase $getStudentPresencesUseCase,
        ListPresencesUseCase $listPresencesUseCase,
        UpdatePresenceStatusUseCase $updatePresenceStatusUseCase
    ) {
        $this->submitBulkUseCase = $submitBulkUseCase;
        $this->getClassPresencesUseCase = $getClassPresencesUseCase;
        $this->getStudentPresencesUseCase = $getStudentPresencesUseCase;
        $this->listPresencesUseCase = $listPresencesUseCase;
        $this->updatePresenceStatusUseCase = $updatePresenceStatusUseCase;
    }

    /**
     * @OA\Post(
     *     path="/api/presences/bulk",
     *     summary="Submit bulk student attendance",
     *     tags={"Attendance"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"seance_id", "date", "presences"},
     *             @OA\Property(property="seance_id", type="integer"),
     *             @OA\Property(property="date", type="string", format="date"),
     *             @OA\Property(
     *                 property="presences",
     *                 type="array",
     *                 @OA\Items(
     *                     required={"eleve_id", "statut"},
     *                     @OA\Property(property="eleve_id", type="integer"),
     *                     @OA\Property(property="statut", type="string", enum={"present", "absent", "retard"}),
     *                     @OA\Property(property="motif", type="string", nullable=true)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Attendance recorded successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function submitBulk(BulkAttendanceRequest $request): JsonResponse
    {
        $dto = BulkAttendanceDTO::fromArray($request->validated());
        $results = $this->submitBulkUseCase->execute($dto);

        return response()->json([
            'message' => 'Absences enregistrées avec succès.',
            'data' => PresenceResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/classes/{id}/presences",
     *     summary="Get attendance sheet for a class on a date",
     *     tags={"Attendance"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="date", in="query", required=true, @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Class attendance retrieved successfully")
     * )
     */
    public function classPresences(int $id, Request $request): JsonResponse
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);
        
        $results = $this->getClassPresencesUseCase->execute($id, $request->query('date'));

        return response()->json([
            'data' => PresenceResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/eleves/{id}/presences",
     *     summary="Get attendance history for a student",
     *     tags={"Attendance"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Student attendance retrieved successfully")
     * )
     */
    public function studentPresences(int $id): JsonResponse
    {
        $results = $this->getStudentPresencesUseCase->execute($id);

        return response()->json([
            'data' => PresenceResource::collection(collect($results))
        ], 200);
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['range', 'search']);
        $results = $this->listPresencesUseCase->execute($filters);

        return response()->json([
            'data' => PresenceResource::collection(collect($results))
        ], 200);
    }

    public function update(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'statut' => 'required|string|in:present,absent,retard',
            'motif' => 'nullable|string',
        ]);

        $result = $this->updatePresenceStatusUseCase->execute($id, $validated['statut'], $validated['motif'] ?? null);

        if (!$result) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        return response()->json([
            'message' => 'Status mis à jour avec succès.',
            'data' => new PresenceResource($result)
        ], 200);
    }
}
