<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Application\UseCases\ListTeachersUseCase;
use App\Application\UseCases\CreateTeacherUseCase;
use App\Domain\Ports\TeacherPortInterface;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class TeacherController extends Controller
{
    private TeacherPortInterface $teacherRepository;
    private ListTeachersUseCase $listTeachersUseCase;
    private CreateTeacherUseCase $createTeacherUseCase;

    public function __construct(
        TeacherPortInterface $teacherRepository,
        ListTeachersUseCase $listTeachersUseCase,
        CreateTeacherUseCase $createTeacherUseCase
    ) {
        $this->teacherRepository = $teacherRepository;
        $this->listTeachersUseCase = $listTeachersUseCase;
        $this->createTeacherUseCase = $createTeacherUseCase;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'specialite']);
        $teachers = $this->listTeachersUseCase->execute($filters);
        return response()->json(['data' => TeacherResource::collection($teachers)]);
    }

    public function store(TeacherRequest $request): JsonResponse
    {
        $teacher = $this->createTeacherUseCase->execute($request->validated());
        return (new TeacherResource($teacher))->response()->setStatusCode(201);
    }

    public function show(int $id): JsonResponse|TeacherResource
    {
        $teacher = $this->teacherRepository->findById($id);
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], Response::HTTP_NOT_FOUND);
        }
        return new TeacherResource($teacher);
    }

    public function update(TeacherRequest $request, int $id): TeacherResource
    {
        $teacher = $this->teacherRepository->update($id, $request->validated());
        return new TeacherResource($teacher);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->teacherRepository->delete($id);
        if (!$deleted) {
            return response()->json(['message' => 'Teacher not found or could not be deleted.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['message' => 'Teacher deleted successfully.'], Response::HTTP_OK);
    }

    public function subjects(): JsonResponse
    {
        $subjects = $this->teacherRepository->findAllSubjects();
        return response()->json(['data' => $subjects]);
    }

    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|integer|exists:enseignants,id',
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'required|integer|exists:matieres,id',
        ]);

        $success = $this->teacherRepository->assignToClassAndSubject(
            $validated['enseignant_id'],
            $validated['classe_id'],
            $validated['matiere_id']
        );

        return response()->json(['success' => $success, 'message' => 'Teacher assigned successfully.']);
    }

    public function unassign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enseignant_id' => 'required|integer|exists:enseignants,id',
            'classe_id' => 'required|integer|exists:classes,id',
            'matiere_id' => 'required|integer|exists:matieres,id',
        ]);

        $success = $this->teacherRepository->removeAssignment(
            $validated['enseignant_id'],
            $validated['classe_id'],
            $validated['matiere_id']
        );

        return response()->json(['success' => $success, 'message' => 'Teacher assignment removed successfully.']);
    }

    public function revealPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_password' => 'required|string',
        ]);

        if (!\Hash::check($validated['admin_password'], \Auth::user()->password)) {
            return response()->json(['message' => 'Invalid administrator password.'], 403);
        }

        $teacher = $this->teacherRepository->findById($id);
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], 404);
        }

        $user = User::find($teacher->user_id ?? null);
        if (!$user) {
            return response()->json(['message' => 'Teacher user account not found.'], 404);
        }

        return response()->json([
            'password' => $user->temp_password ?? 'N/A',
        ]);
    }

    public function uploadAvatar(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $teacher = $this->teacherRepository->findById($id);
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found.'], Response::HTTP_NOT_FOUND);
        }

        $user = User::find($teacher->user_id ?? null);
        if (!$user) {
            return response()->json(['message' => 'Teacher user account not found.'], Response::HTTP_NOT_FOUND);
        }

        // Delete old avatar file if it exists and is a stored file (not a URL)
        if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store the new avatar file
        $path = $request->file('avatar')->store('avatars', 'public');

        // Build the full public URL
        $url = Storage::disk('public')->url($path);

        // Update user avatar
        $user->avatar = $url;
        $user->save();

        return response()->json([
            'avatar_url' => $url,
            'message' => 'Avatar uploaded successfully.',
        ]);
    }
}
