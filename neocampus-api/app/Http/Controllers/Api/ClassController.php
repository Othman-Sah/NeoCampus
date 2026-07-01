<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClassRequest;
use App\Http\Resources\ClassResource;
use App\Application\UseCases\ListClassesUseCase;
use App\Application\UseCases\CreateClassUseCase;
use App\Application\UseCases\UpdateClassUseCase;
use App\Domain\Ports\ClassPortInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClassController extends Controller
{
    private ClassPortInterface $classRepository;
    private ListClassesUseCase $listClassesUseCase;
    private CreateClassUseCase $createClassUseCase;
    private UpdateClassUseCase $updateClassUseCase;

    public function __construct(
        ClassPortInterface $classRepository,
        ListClassesUseCase $listClassesUseCase,
        CreateClassUseCase $createClassUseCase,
        UpdateClassUseCase $updateClassUseCase
    ) {
        $this->classRepository = $classRepository;
        $this->listClassesUseCase = $listClassesUseCase;
        $this->createClassUseCase = $createClassUseCase;
        $this->updateClassUseCase = $updateClassUseCase;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['section_id', 'annee_scolaire_id', 'search']);
        $classes = $this->listClassesUseCase->execute($filters);
        return response()->json(['data' => ClassResource::collection($classes)]);
    }

    public function store(ClassRequest $request): JsonResponse
    {
        $class = $this->createClassUseCase->execute($request->validated());
        return (new ClassResource($class))->response()->setStatusCode(201);
    }

    public function show(int $id): JsonResponse|ClassResource
    {
        $class = $this->classRepository->findById($id);
        if (!$class) {
            return response()->json(['message' => 'Class not found.'], Response::HTTP_NOT_FOUND);
        }
        return new ClassResource($class);
    }

    public function update(ClassRequest $request, int $id): ClassResource
    {
        $class = $this->updateClassUseCase->execute($id, $request->validated());
        return new ClassResource($class);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->classRepository->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Class not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Class deleted successfully.'], Response::HTTP_OK);
    }

    public function academicYears(): JsonResponse
    {
        $years = $this->classRepository->findAllAcademicYears();
        return response()->json(['data' => $years]);
    }
}
