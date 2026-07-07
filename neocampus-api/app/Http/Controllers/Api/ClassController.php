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

    public function students(int $id): JsonResponse
    {
        $students = \App\Models\Eleve::where('classe_id', $id)->get();
        return response()->json(['data' => $students]);
    }

    public function getMatieres(int $classeId): JsonResponse
    {
        $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id;
        $class = \App\Models\Classe::where('id', $classeId)->where('etablissement_id', $tenantId)->firstOrFail();
        $matieres = $class->matieres;

        // Fetch per-class coefficients
        $coefficients = \App\Models\CoefficientClasseMatiere::where('classe_id', $classeId)
            ->where('etablissement_id', $tenantId)
            ->get()
            ->keyBy('matiere_id');

        // Fetch teacher assignments from charge_horaires
        $charges = \App\Models\ChargeHoraire::with('enseignant.user')
            ->where('classe_id', $classeId)
            ->get()
            ->keyBy('matiere_id');

        $response = $matieres->map(function ($matiere) use ($coefficients, $charges) {
            $coefOverride = $coefficients->get($matiere->id);
            $charge = $charges->get($matiere->id);
            $enseignant = null;
            if ($charge && $charge->enseignant) {
                $enseignant = [
                    'id' => $charge->enseignant->id,
                    'nom' => $charge->enseignant->user->nom ?? '',
                    'prenom' => $charge->enseignant->user->prenom ?? '',
                ];
            }
            return [
                'matiere_id' => $matiere->id,
                'nom' => $matiere->nom,
                'code' => $matiere->code,
                'coefficient_global' => (float)$matiere->coefficient,
                'coefficient_classe' => $coefOverride ? (float)$coefOverride->coefficient : null,
                'enseignant' => $enseignant
            ];
        });

        return response()->json(['data' => $response]);
    }

    public function addMatiere(Request $request, int $classeId): JsonResponse
    {
        $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id;
        $validated = $request->validate([
            'matiere_id' => 'required|integer|exists:matieres,id',
        ]);

        $classe = \App\Models\Classe::where('id', $classeId)->where('etablissement_id', $tenantId)->firstOrFail();

        // Attach without duplicates
        $classe->matieres()->syncWithoutDetaching([
            $validated['matiere_id'] => ['etablissement_id' => $tenantId]
        ]);

        return response()->json(['message' => 'Subject added to class successfully.'], 200);
    }

    public function removeMatiere(int $classeId, int $matiereId): JsonResponse
    {
        $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id;

        // Check if exams exist for this class and subject
        $hasExams = \App\Models\Examen::where('classe_id', $classeId)
            ->where('matiere_id', $matiereId)
            ->where('etablissement_id', $tenantId)
            ->exists();

        if ($hasExams) {
            return response()->json([
                'message' => 'Cannot remove subject because exams or grades already exist for this class and subject.'
            ], 409);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($classeId, $matiereId, $tenantId) {
            // Delete pivot record
            \Illuminate\Support\Facades\DB::table('classe_matiere')
                ->where('classe_id', $classeId)
                ->where('matiere_id', $matiereId)
                ->where('etablissement_id', $tenantId)
                ->delete();

            // Delete charge_horaire (teacher assignment)
            \App\Models\ChargeHoraire::where('classe_id', $classeId)
                ->where('matiere_id', $matiereId)
                ->delete();

            // Delete coefficient override
            \App\Models\CoefficientClasseMatiere::where('classe_id', $classeId)
                ->where('matiere_id', $matiereId)
                ->where('etablissement_id', $tenantId)
                ->delete();
        });

        return response()->json(['message' => 'Subject removed from class successfully.'], 200);
    }

    public function updateTeacher(Request $request, int $classeId, int $matiereId): JsonResponse
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|integer|exists:enseignants,id',
        ]);

        $charge = \App\Models\ChargeHoraire::where('classe_id', $classeId)
            ->where('matiere_id', $matiereId)
            ->first();

        if ($charge) {
            $charge->update(['enseignant_id' => $validated['enseignant_id']]);
        } else {
            \App\Models\ChargeHoraire::create([
                'classe_id' => $classeId,
                'matiere_id' => $matiereId,
                'enseignant_id' => $validated['enseignant_id']
            ]);
        }

        return response()->json(['message' => 'Teacher assigned successfully.'], 200);
    }

    public function updateCoefficient(Request $request, int $classeId, int $matiereId): JsonResponse
    {
        $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id;
        $validated = $request->validate([
            'coefficient' => 'required|numeric|min:0',
        ]);

        $coef = \App\Models\CoefficientClasseMatiere::updateOrCreate(
            [
                'classe_id' => $classeId,
                'matiere_id' => $matiereId,
                'etablissement_id' => $tenantId,
            ],
            [
                'coefficient' => $validated['coefficient']
            ]
        );

        return response()->json([
            'message' => 'Coefficient updated successfully.',
            'data' => $coef
        ], 200);
    }

    public function getMatieresWithEnseignants(int $classeId): JsonResponse
    {
        $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id;

        $class = \App\Models\Classe::where('id', $classeId)->where('etablissement_id', $tenantId)->firstOrFail();
        $matieres = $class->matieres;

        // Fetch charge_horaires for this class
        $charges = \App\Models\ChargeHoraire::with('enseignant.user')
            ->where('classe_id', $classeId)
            ->get()
            ->keyBy('matiere_id');

        $data = $matieres->map(function ($matiere) use ($charges) {
            $charge = $charges->get($matiere->id);
            return [
                'matiere_id' => $matiere->id,
                'matiere_nom' => $matiere->nom,
                'enseignant_id' => $charge?->enseignant_id,
                'enseignant_nom' => $charge && $charge->enseignant && $charge->enseignant->user
                    ? ($charge->enseignant->user->prenom . ' ' . $charge->enseignant->user->nom)
                    : null,
            ];
        });

        return response()->json(['data' => $data]);
    }
}
