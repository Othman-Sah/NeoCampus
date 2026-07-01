<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SalaryRequest;
use App\Http\Resources\SalaryResource;
use App\Application\UseCases\ManageSalaryUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class SalaryController extends Controller
{
    private ManageSalaryUseCase $manageSalaryUseCase;

    public function __construct(ManageSalaryUseCase $manageSalaryUseCase)
    {
        $this->manageSalaryUseCase = $manageSalaryUseCase;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['mois', 'enseignant_id', 'statut']);
        $salaries = $this->manageSalaryUseCase->list($filters);
        return response()->json(['data' => SalaryResource::collection($salaries)]);
    }

    public function store(SalaryRequest $request): JsonResponse
    {
        $salary = $this->manageSalaryUseCase->create($request->validated());
        return (new SalaryResource($salary))->response()->setStatusCode(201);
    }

    public function show(int $id): JsonResponse|SalaryResource
    {
        $salaries = $this->manageSalaryUseCase->list([]);
        $salary = collect($salaries)->firstWhere('id', $id);

        if (!$salary) {
            return response()->json(['message' => 'Salary record not found.'], Response::HTTP_NOT_FOUND);
        }
        return new SalaryResource($salary);
    }

    public function update(SalaryRequest $request, int $id): SalaryResource
    {
        $salary = $this->manageSalaryUseCase->update($id, $request->validated());
        return new SalaryResource($salary);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->manageSalaryUseCase->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Salary record not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Salary record deleted successfully.'], Response::HTTP_OK);
    }

    public function mySalaries(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], Response::HTTP_FORBIDDEN);
        }

        $enseignant = \App\Models\Enseignant::where('user_id', $user->id)->first();
        if (!$enseignant) {
            return response()->json(['data' => []]);
        }

        $salaries = $this->manageSalaryUseCase->getForTeacher($enseignant->id);
        return response()->json(['data' => SalaryResource::collection($salaries)]);
    }
}
