<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SectionRequest;
use App\Http\Resources\SectionResource;
use App\Application\UseCases\ListSectionsUseCase;
use App\Application\UseCases\CreateSectionUseCase;
use App\Domain\Ports\ClassPortInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class SectionController extends Controller
{
    private ClassPortInterface $classRepository;
    private ListSectionsUseCase $listSectionsUseCase;
    private CreateSectionUseCase $createSectionUseCase;

    public function __construct(
        ClassPortInterface $classRepository,
        ListSectionsUseCase $listSectionsUseCase,
        CreateSectionUseCase $createSectionUseCase
    ) {
        $this->classRepository = $classRepository;
        $this->listSectionsUseCase = $listSectionsUseCase;
        $this->createSectionUseCase = $createSectionUseCase;
    }

    public function index(): JsonResponse
    {
        $sections = $this->listSectionsUseCase->execute();
        return response()->json(['data' => SectionResource::collection($sections)]);
    }

    public function store(SectionRequest $request): JsonResponse
    {
        $section = $this->createSectionUseCase->execute($request->validated());
        return (new SectionResource($section))->response()->setStatusCode(201);
    }

    public function show(int $id): JsonResponse|SectionResource
    {
        $section = $this->classRepository->findSectionById($id);
        if (!$section) {
            return response()->json(['message' => 'Section not found.'], Response::HTTP_NOT_FOUND);
        }
        return new SectionResource($section);
    }

    public function update(SectionRequest $request, int $id): SectionResource
    {
        $section = $this->classRepository->updateSection($id, $request->validated());
        return new SectionResource($section);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->classRepository->deleteSection($id);
        if (!$deleted) {
            return response()->json(['message' => 'Section not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Section deleted successfully.'], Response::HTTP_OK);
    }
}
