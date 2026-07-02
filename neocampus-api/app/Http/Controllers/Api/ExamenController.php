<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProposeExamScheduleRequest;
use App\Http\Requests\ReviewExamScheduleRequest;
use App\Http\Requests\UploadExamSujetRequest;
use App\Http\Resources\ExamenResource;
use App\Http\Resources\DemandePlannificationExamenResource;
use App\Http\Resources\ParametresExamenResource;
use App\Application\DTOs\ProposeExamScheduleDTO;
use App\Application\UseCases\ProposeExamScheduleUseCase;
use App\Application\UseCases\ReviewExamScheduleUseCase;
use App\Application\UseCases\UploadExamSujetUseCase;
use App\Application\UseCases\GetExamTemplateUseCase;
use App\Domain\Ports\ExamenPortInterface;
use App\Models\Enseignant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * @OA\Tag(name="Exams", description="Endpoints for exam scheduling, uploading, and parameters management")
 */
class ExamenController extends Controller
{
    private ProposeExamScheduleUseCase $proposeScheduleUseCase;
    private ReviewExamScheduleUseCase $reviewScheduleUseCase;
    private UploadExamSujetUseCase $uploadSujetUseCase;
    private GetExamTemplateUseCase $getTemplateUseCase;
    private ExamenPortInterface $examenRepository;

    public function __construct(
        ProposeExamScheduleUseCase $proposeScheduleUseCase,
        ReviewExamScheduleUseCase $reviewScheduleUseCase,
        UploadExamSujetUseCase $uploadSujetUseCase,
        GetExamTemplateUseCase $getTemplateUseCase,
        ExamenPortInterface $examenRepository
    ) {
        $this->proposeScheduleUseCase = $proposeScheduleUseCase;
        $this->reviewScheduleUseCase = $reviewScheduleUseCase;
        $this->uploadSujetUseCase = $uploadSujetUseCase;
        $this->getTemplateUseCase = $getTemplateUseCase;
        $this->examenRepository = $examenRepository;
    }

    /**
     * @OA\Post(
     *     path="/api/examens/propose-schedule",
     *     summary="Teacher proposes an exam date/time",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"intitule", "classe_id", "matiere_id", "date_proposee"},
     *             @OA\Property(property="intitule", type="string"),
     *             @OA\Property(property="classe_id", type="integer"),
     *             @OA\Property(property="matiere_id", type="integer"),
     *             @OA\Property(property="date_proposee", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Proposal created successfully")
     * )
     */
    public function proposeSchedule(ProposeExamScheduleRequest $request): JsonResponse
    {
        $dto = ProposeExamScheduleDTO::fromArray($request->validated());
        $result = $this->proposeScheduleUseCase->execute($dto, $request->user()->id);

        return response()->json([
            'message' => 'Proposition de planification soumise aux administrateurs.',
            'data' => [
                'examen' => new ExamenResource($result['examen']),
                'proposal' => new DemandePlannificationExamenResource($result['proposal']),
            ]
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/examens/schedule/{id}/review",
     *     summary="Admin reviews teacher proposed exam schedule",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"statut"},
     *             @OA\Property(property="statut", type="string", enum={"approved", "rejected"}),
     *             @OA\Property(property="commentaire_admin", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Proposal reviewed")
     * )
     */
    public function reviewSchedule(int $id, ReviewExamScheduleRequest $request): JsonResponse
    {
        $result = $this->reviewScheduleUseCase->execute(
            $id,
            $request->input('statut'),
            $request->input('commentaire_admin'),
            $request->user()->id
        );

        return response()->json([
            'message' => 'Planification d\'examen mise à jour avec succès.',
            'data' => new DemandePlannificationExamenResource($result)
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/examens/{id}/upload-sujet",
     *     summary="Teacher uploads the exam subject PDF/DOCX copy",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Exam subject copy uploaded")
     * )
     */
    public function uploadSujet(int $id, UploadExamSujetRequest $request): JsonResponse
    {
        $examen = \App\Models\Examen::findOrFail($id);
        \Illuminate\Support\Facades\Gate::authorize('uploadSujet', $examen);

        $result = $this->uploadSujetUseCase->execute($id, $request->file('file'));

        return response()->json([
            'message' => 'Sujet d\'examen téléversé avec succès.',
            'data' => new ExamenResource($result)
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/parametres-examens/template",
     *     summary="Download the school's official exam template document",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="File download stream")
     * )
     */
    public function downloadTemplate(): BinaryFileResponse|JsonResponse
    {
        try {
            $path = $this->getTemplateUseCase->execute();
            if (Storage::disk('public')->exists($path)) {
                return response()->download(Storage::disk('public')->path($path));
            }

            // Create a fake/placeholder gabarit if file doesn't exist
            $placeholderDir = storage_path('app/public/templates');
            if (!is_dir($placeholderDir)) {
                mkdir($placeholderDir, 0755, true);
            }
            $placeholderPath = $placeholderDir . '/exam_template_emsi.docx';
            if (!file_exists($placeholderPath)) {
                file_put_contents($placeholderPath, 'EMSI School Exam Template Placeholder DOCX Content');
            }
            return response()->download($placeholderPath, 'Gabarit_Sujet_EMSI.docx');
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/examens/teacher",
     *     summary="Get exams list for the authenticated teacher",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="List of teacher's exams")
     * )
     */
    public function teacherExams(Request $request): JsonResponse
    {
        $teacher = Enseignant::where('user_id', $request->user()->id)->first();
        if (!$teacher) {
            throw new HttpException(403, "Teacher profile required.");
        }

        $results = $this->examenRepository->getTeacherExams($teacher->id);

        return response()->json([
            'data' => ExamenResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/admin/examens/proposals/pending",
     *     summary="Get pending schedule proposals",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="List of pending schedule proposals")
     * )
     */
    public function pendingProposals(): JsonResponse
    {
        $results = $this->examenRepository->getPendingProposals();

        return response()->json([
            'data' => DemandePlannificationExamenResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/parametres-examens",
     *     summary="Get current exam settings",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Global exam parameters")
     * )
     */
    public function getSettings(): JsonResponse
    {
        $settings = $this->examenRepository->findSettings();

        return response()->json([
            'data' => $settings ? new ParametresExamenResource($settings) : null
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/admin/parametres-examens",
     *     summary="Update exam settings (Admin only)",
     *     tags={"Exams"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(response=200, description="Settings updated")
     * )
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'periode_saisie_notes_debut' => 'required|date',
            'periode_saisie_notes_fin' => 'required|date|after:periode_saisie_notes_debut',
            'force_admin_schedule' => 'required|boolean',
            'require_sujet_upload' => 'required|boolean',
            'template_sujet_path' => 'nullable|string',
        ]);

        $result = $this->examenRepository->updateSettings($validated);

        return response()->json([
            'message' => 'Configuration des examens enregistrée avec succès.',
            'data' => new ParametresExamenResource($result)
        ], 200);
    }
}
