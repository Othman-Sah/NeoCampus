<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SeanceRequest;
use App\Http\Resources\SeanceResource;
use App\Application\UseCases\ListSeancesUseCase;
use App\Application\UseCases\CreateSeanceUseCase;
use App\Application\UseCases\UpdateSeanceUseCase;
use App\Application\UseCases\DeleteSeanceUseCase;
use App\Application\DTOs\SeanceDTO;
use App\Domain\Ports\SeancePortInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SeanceController extends Controller
{
    private SeancePortInterface $seanceRepository;
    private ListSeancesUseCase $listSeancesUseCase;
    private CreateSeanceUseCase $createSeanceUseCase;
    private UpdateSeanceUseCase $updateSeanceUseCase;
    private DeleteSeanceUseCase $deleteSeanceUseCase;

    public function __construct(
        SeancePortInterface $seanceRepository,
        ListSeancesUseCase $listSeancesUseCase,
        CreateSeanceUseCase $createSeanceUseCase,
        UpdateSeanceUseCase $updateSeanceUseCase,
        DeleteSeanceUseCase $deleteSeanceUseCase
    ) {
        $this->seanceRepository = $seanceRepository;
        $this->listSeancesUseCase = $listSeancesUseCase;
        $this->createSeanceUseCase = $createSeanceUseCase;
        $this->updateSeanceUseCase = $updateSeanceUseCase;
        $this->deleteSeanceUseCase = $deleteSeanceUseCase;
    }

    public function classSeances(int $id): JsonResponse
    {
        $seances = $this->listSeancesUseCase->execute(['classe_id' => $id]);
        return response()->json(['data' => SeanceResource::collection($seances)]);
    }

    public function teacherSeances(int $id): JsonResponse
    {
        $seances = $this->listSeancesUseCase->execute(['enseignant_id' => $id]);
        return response()->json(['data' => SeanceResource::collection($seances)]);
    }

    public function store(SeanceRequest $request): JsonResponse
    {
        $dto = SeanceDTO::fromArray($request->validated());
        $seance = $this->createSeanceUseCase->execute($dto);
        return (new SeanceResource($seance))->response()->setStatusCode(201);
    }

    public function update(SeanceRequest $request, int $id): JsonResponse
    {
        $seanceExists = $this->seanceRepository->findById($id);
        if (!$seanceExists) {
            return response()->json(['message' => 'Session not found.'], Response::HTTP_NOT_FOUND);
        }

        $dto = SeanceDTO::fromArray($request->validated());
        $seance = $this->updateSeanceUseCase->execute($id, $dto);
        return response()->json(['data' => new SeanceResource($seance)]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->deleteSeanceUseCase->execute($id);
        if (!$deleted) {
            return response()->json(['message' => 'Session not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Session deleted successfully.'], Response::HTTP_OK);
    }
}
