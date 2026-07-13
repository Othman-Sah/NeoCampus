<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenerateBulletinRequest;
use App\Http\Requests\GenerateSingleBulletinRequest;
use App\Http\Requests\UpdateAppreciationsRequest;
use App\Http\Resources\BulletinResource;
use App\Application\DTOs\GenerateBulletinDTO;
use App\Application\DTOs\GenerateSingleBulletinDTO;
use App\Application\UseCases\GenerateBulletinsUseCase;
use App\Application\UseCases\GenerateSingleBulletinUseCase;
use App\Application\UseCases\UpdateAppreciationsUseCase;
use App\Application\UseCases\PublishBulletinUseCase;
use App\Application\UseCases\GetBulletinUseCase;
use App\Application\UseCases\GetClassBulletinsUseCase;
use App\Application\UseCases\UpdateDecisionUseCase;
use App\Application\UseCases\ValidateBulletinUseCase;
use App\Models\Bulletin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(name="Bulletins", description="Endpoints for student report cards/bulletins")
 */
class BulletinController extends Controller
{
    private GenerateBulletinsUseCase $generateBulletinsUseCase;
    private GenerateSingleBulletinUseCase $generateSingleBulletinUseCase;
    private UpdateAppreciationsUseCase $updateAppreciationsUseCase;
    private PublishBulletinUseCase $publishBulletinUseCase;
    private GetBulletinUseCase $getBulletinUseCase;
    private GetClassBulletinsUseCase $getClassBulletinsUseCase;
    private UpdateDecisionUseCase $updateDecisionUseCase;
    private ValidateBulletinUseCase $validateBulletinUseCase;

    public function __construct(
        GenerateBulletinsUseCase $generateBulletinsUseCase,
        GenerateSingleBulletinUseCase $generateSingleBulletinUseCase,
        UpdateAppreciationsUseCase $updateAppreciationsUseCase,
        PublishBulletinUseCase $publishBulletinUseCase,
        GetBulletinUseCase $getBulletinUseCase,
        GetClassBulletinsUseCase $getClassBulletinsUseCase,
        UpdateDecisionUseCase $updateDecisionUseCase,
        ValidateBulletinUseCase $validateBulletinUseCase
    ) {
        $this->generateBulletinsUseCase = $generateBulletinsUseCase;
        $this->generateSingleBulletinUseCase = $generateSingleBulletinUseCase;
        $this->updateAppreciationsUseCase = $updateAppreciationsUseCase;
        $this->publishBulletinUseCase = $publishBulletinUseCase;
        $this->getBulletinUseCase = $getBulletinUseCase;
        $this->getClassBulletinsUseCase = $getClassBulletinsUseCase;
        $this->updateDecisionUseCase = $updateDecisionUseCase;
        $this->validateBulletinUseCase = $validateBulletinUseCase;
    }

    /**
     * @OA\Post(
     *     path="/api/bulletins/generate/bulk",
     *     summary="Bulk generate bulletins for a class, period, and academic year",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"classe_id", "periode", "annee_scolaire"},
     *             @OA\Property(property="classe_id", type="integer"),
     *             @OA\Property(property="periode", type="string"),
     *             @OA\Property(property="annee_scolaire", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bulletins generated successfully")
     * )
     */
    public function generateBulk(GenerateBulletinRequest $request): JsonResponse
    {
        $this->authorize('generate', Bulletin::class);

        $dto = GenerateBulletinDTO::fromArray($request->validated());
        $results = $this->generateBulletinsUseCase->execute($dto);

        return response()->json([
            'message' => 'Bulletins de notes générés en masse avec succès.',
            'data' => BulletinResource::collection(collect($results))
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/bulletins/generate/single",
     *     summary="Generate or regenerate a bulletin for a single student",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"eleve_id", "periode", "annee_scolaire"},
     *             @OA\Property(property="eleve_id", type="integer"),
     *             @OA\Property(property="periode", type="string"),
     *             @OA\Property(property="annee_scolaire", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Bulletin generated successfully")
     * )
     */
    public function generateSingle(GenerateSingleBulletinRequest $request): JsonResponse
    {
        $this->authorize('generate', Bulletin::class);

        $dto = GenerateSingleBulletinDTO::fromArray($request->validated());
        $bulletinId = $this->generateSingleBulletinUseCase->execute($dto);

        return response()->json([
            'message' => 'Bulletin de notes généré/mis à jour avec succès.',
            'bulletin_id' => $bulletinId
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/bulletins/{id}/appreciations",
     *     summary="Submit course appreciation comments",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"matiere_id", "appreciation"},
     *             @OA\Property(property="matiere_id", type="integer"),
     *             @OA\Property(property="appreciation", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Appreciation updated successfully")
     * )
     */
    public function updateAppreciations(UpdateAppreciationsRequest $request, string $id): JsonResponse
    {
        $bulletin = Bulletin::findOrFail($id);
        $this->authorize('update', $bulletin);

        $this->updateAppreciationsUseCase->execute(
            $id,
            (int) $request->validated()['matiere_id'],
            $request->validated()['appreciation'],
            $request->user()->id
        );

        return response()->json([
            'message' => 'Appréciation de l\'enseignant enregistrée avec succès.'
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/bulletins/{id}/publish",
     *     summary="Publish a bulletin",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *     @OA\Response(response=200, description="Bulletin published successfully")
     * )
     */
    public function publish(string $id): JsonResponse
    {
        $bulletin = Bulletin::findOrFail($id);
        $this->authorize('publish', $bulletin);

        $this->publishBulletinUseCase->execute($id);

        return response()->json([
            'message' => 'Bulletin publié avec succès.'
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/bulletins/{id}",
     *     summary="Retrieve a deeply nested report card bulletin",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="string", format="uuid")),
     *     @OA\Response(response=200, description="Bulletin details retrieved")
     * )
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $bulletin = Bulletin::findOrFail($id);
        $this->authorize('view', $bulletin);

        $bulletinData = $this->getBulletinUseCase->execute($id, $request->user()->id);

        if (!$bulletinData) {
            return response()->json(['message' => 'Bulletin de notes introuvable.'], 404);
        }

        $bulletin = Bulletin::with([
            'eleve.user',
            'classe.section',
            'details.matiere.groupeMatiere',
            'details.prof.user',
            'etablissement'
        ])->find($id);

        return response()->json([
            'data' => new BulletinResource($bulletin)
        ], 200);
    }

    /**
     * @OA\Get(
     *     path="/api/classes/{id}/bulletins",
     *     summary="Get all bulletins for a class in a specific period",
     *     tags={"Bulletins"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="periode", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Parameter(name="annee_scolaire", in="query", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Class bulletins list retrieved")
     * )
     */
    public function classBulletins(Request $request, int $id): JsonResponse
    {
        $this->authorize('generate', Bulletin::class);

        $request->validate([
            'periode' => 'required|string',
            'annee_scolaire' => 'required|string',
        ]);

        $results = $this->getClassBulletinsUseCase->execute(
            $id,
            $request->query('periode'),
            $request->query('annee_scolaire')
        );

        $bulletins = Bulletin::with(['eleve'])
            ->where('classe_id', $id)
            ->where('periode', $request->query('periode'))
            ->where('annee_scolaire', $request->query('annee_scolaire'))
            ->get();

        return response()->json([
            'data' => BulletinResource::collection($bulletins)
        ], 200);
    }

    /**
     * Get bulletins for the authenticated student or parent.
     */
    public function getMyBulletins(Request $request): JsonResponse
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $bulletins = collect();

        if ($user->role === 'eleve') {
            $student = \App\Models\Eleve::where('user_id', $user->id)->first();
            if ($student) {
                $bulletins = Bulletin::with(['eleve', 'classe', 'details.matiere', 'details.prof.user', 'etablissement'])
                    ->where('eleve_id', $student->id)
                    ->where('status', 'PUBLISHED')
                    ->get();
            }
        } elseif ($user->role === 'parent') {
            $pivotStudentIds = $user->children()->pluck('eleves.id');
            $jsonStudentIds = \App\Models\Eleve::where('parent_contact->email', $user->email)->pluck('id');
            $studentIds = $pivotStudentIds->merge($jsonStudentIds)->unique()->toArray();

            if (!empty($studentIds)) {
                $bulletins = Bulletin::with(['eleve', 'classe', 'details.matiere', 'details.prof.user', 'etablissement'])
                    ->whereIn('eleve_id', $studentIds)
                    ->where('status', 'PUBLISHED')
                    ->get();
            }
        }

        return response()->json([
            'data' => BulletinResource::collection($bulletins)
        ], 200);
    }

    public function updateDecision(Request $request, string $id): JsonResponse
    {
        $bulletin = Bulletin::findOrFail($id);
        $this->authorize('update', $bulletin);

        $validated = $request->validate([
            'decision_conseil' => 'nullable|string|in:admis,admis_conditionnel,redoublement,exclusion',
            'mention' => 'nullable|string|in:felicitations,tableau_honneur,encouragements,avertissement_travail,avertissement_conduite,blame',
            'appreciation_generale' => 'nullable|string',
        ]);

        $this->updateDecisionUseCase->execute(
            $id,
            $validated['decision_conseil'] ?? null,
            $validated['mention'] ?? null,
            $validated['appreciation_generale'] ?? null
        );

        return response()->json([
            'message' => 'Council decision updated successfully.'
        ], 200);
    }

    public function validateBulletin(Request $request, string $id): JsonResponse
    {
        $bulletin = Bulletin::findOrFail($id);
        $this->authorize('publish', $bulletin); // admin action

        $this->validateBulletinUseCase->execute($id, $request->user()->id);

        return response()->json([
            'message' => 'Bulletin validated and locked successfully.'
        ], 200);
    }
}
