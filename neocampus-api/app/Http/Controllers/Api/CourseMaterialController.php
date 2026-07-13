<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupportRequest;
use App\Http\Requests\StoreDevoirRequest;
use App\Application\DTOs\CreateSupportDTO;
use App\Application\DTOs\CreateDevoirDTO;
use App\Application\UseCases\CourseMaterial\CreateSupportUseCase;
use App\Application\UseCases\CourseMaterial\DeleteSupportUseCase;
use App\Application\UseCases\CourseMaterial\CreateDevoirUseCase;
use App\Application\UseCases\CourseMaterial\UpdateDevoirUseCase;
use App\Application\UseCases\CourseMaterial\DeleteDevoirUseCase;
use App\Domain\Ports\CourseMaterialPortInterface;
use App\Http\Resources\SupportResource;
use App\Http\Resources\DevoirResource;
use App\Models\Enseignant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseMaterialController extends Controller
{
    private CreateSupportUseCase $createSupportUseCase;
    private DeleteSupportUseCase $deleteSupportUseCase;
    private CreateDevoirUseCase $createDevoirUseCase;
    private UpdateDevoirUseCase $updateDevoirUseCase;
    private DeleteDevoirUseCase $deleteDevoirUseCase;
    private CourseMaterialPortInterface $courseMaterialRepository;

    public function __construct(
        CreateSupportUseCase $createSupportUseCase,
        DeleteSupportUseCase $deleteSupportUseCase,
        CreateDevoirUseCase $createDevoirUseCase,
        UpdateDevoirUseCase $updateDevoirUseCase,
        DeleteDevoirUseCase $deleteDevoirUseCase,
        CourseMaterialPortInterface $courseMaterialRepository
    ) {
        $this->createSupportUseCase = $createSupportUseCase;
        $this->deleteSupportUseCase = $deleteSupportUseCase;
        $this->createDevoirUseCase = $createDevoirUseCase;
        $this->updateDevoirUseCase = $updateDevoirUseCase;
        $this->deleteDevoirUseCase = $deleteDevoirUseCase;
        $this->courseMaterialRepository = $courseMaterialRepository;
    }

    public function indexSupports(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'nullable|integer|exists:matieres,id',
        ]);

        $results = $this->courseMaterialRepository->listSupports($validated['classe_id'], $validated['matiere_id'] ?? null);

        return response()->json([
            'data' => SupportResource::collection($results)
        ], 200);
    }

    public function storeSupport(StoreSupportRequest $request): JsonResponse
    {
        $teacher = Enseignant::where('user_id', $request->user()->id)->firstOrFail();
        
        $data = $request->validated();
        $data['enseignant_id'] = $teacher->id;
        $data['etablissement_id'] = $request->user()->etablissement_id;

        $dto = CreateSupportDTO::fromArray($data);
        $result = $this->createSupportUseCase->execute($dto);

        return response()->json([
            'message' => 'Support de cours ajouté avec succès.',
            'data' => new SupportResource($result)
        ], 201);
    }

    public function destroySupport(int $id): JsonResponse
    {
        $deleted = $this->deleteSupportUseCase->execute($id);

        if ($deleted) {
            return response()->json([
                'message' => 'Support de cours supprimé avec succès.'
            ], 200);
        }

        return response()->json([
            'message' => 'Impossible de trouver ou de supprimer le support.'
        ], 400);
    }

    public function indexHomework(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'nullable|integer|exists:matieres,id',
        ]);

        $results = $this->courseMaterialRepository->listHomework($validated['classe_id'], $validated['matiere_id'] ?? null);

        return response()->json([
            'data' => DevoirResource::collection($results)
        ], 200);
    }

    public function storeHomework(StoreDevoirRequest $request): JsonResponse
    {
        $teacher = Enseignant::where('user_id', $request->user()->id)->firstOrFail();

        $data = $request->validated();
        $data['enseignant_id'] = $teacher->id;
        $data['etablissement_id'] = $request->user()->etablissement_id;

        $dto = CreateDevoirDTO::fromArray($data);
        $result = $this->createDevoirUseCase->execute($dto);

        return response()->json([
            'message' => 'Devoir créé avec succès.',
            'data' => new DevoirResource($result)
        ], 201);
    }

    public function updateHomework(StoreDevoirRequest $request, int $id): JsonResponse
    {
        $teacher = Enseignant::where('user_id', $request->user()->id)->firstOrFail();

        $data = $request->validated();
        $data['enseignant_id'] = $teacher->id;
        $data['etablissement_id'] = $request->user()->etablissement_id;

        $dto = CreateDevoirDTO::fromArray($data);
        $result = $this->updateDevoirUseCase->execute($id, $dto);

        if ($result) {
            return response()->json([
                'message' => 'Devoir mis à jour avec succès.',
                'data' => new DevoirResource($result)
            ], 200);
        }

        return response()->json([
            'message' => 'Devoir introuvable.'
        ], 404);
    }

    public function destroyHomework(int $id): JsonResponse
    {
        $deleted = $this->deleteDevoirUseCase->execute($id);

        if ($deleted) {
            return response()->json([
                'message' => 'Devoir supprimé avec succès.'
            ], 200);
        }

        return response()->json([
            'message' => 'Impossible de trouver ou de supprimer le devoir.'
        ], 400);
    }
}
