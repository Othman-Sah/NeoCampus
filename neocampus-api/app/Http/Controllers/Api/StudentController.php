<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StudentRequest;
use App\Http\Resources\StudentResource;
use App\Application\UseCases\RegisterStudentUseCase;
use App\Application\UseCases\UpdateStudentUseCase;
use App\Application\UseCases\SearchStudentsUseCase;
use App\Domain\Ports\StudentPortInterface;
use App\Application\DTOs\CreateStudentDTO;
use App\Models\Eleve;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class StudentController extends Controller
{
    private StudentPortInterface $studentRepository;
    private RegisterStudentUseCase $registerStudentUseCase;
    private UpdateStudentUseCase $updateStudentUseCase;
    private SearchStudentsUseCase $searchStudentsUseCase;

    public function __construct(
        StudentPortInterface $studentRepository,
        RegisterStudentUseCase $registerStudentUseCase,
        UpdateStudentUseCase $updateStudentUseCase,
        SearchStudentsUseCase $searchStudentsUseCase
    ) {
        $this->studentRepository = $studentRepository;
        $this->registerStudentUseCase = $registerStudentUseCase;
        $this->updateStudentUseCase = $updateStudentUseCase;
        $this->searchStudentsUseCase = $searchStudentsUseCase;
    }

    #[OA\Get(
        path: "/api/admin/eleves",
        summary: "Search and filter students with tenant isolation",
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "search", in: "query", description: "Search by name or matricule", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "classe_id", in: "query", description: "Filter by class ID", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "section", in: "query", description: "Filter by section name", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "status", in: "query", description: "Filter by status", required: false, schema: new OA\Schema(type: "string"))
        ],
        responses: [
            new OA\Response(response: 200, description: "List of students"),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 403, description: "Forbidden")
        ]
    )]
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'classe_id', 'section', 'status']);
        $students = $this->searchStudentsUseCase->execute($filters);
        
        return StudentResource::collection($students);
    }

    #[OA\Post(
        path: "/api/admin/eleves",
        summary: "Enroll a new student",
        tags: ["Students"],
        responses: [
            new OA\Response(response: 201, description: "Student created successfully"),
            new OA\Response(response: 422, description: "Validation error")
        ]
    )]
    public function store(StudentRequest $request): StudentResource
    {
        $dto = new CreateStudentDTO($request->validated());
        $student = $this->registerStudentUseCase->execute($dto);
        
        return new StudentResource($student);
    }

    #[OA\Get(
        path: "/api/admin/eleves/{id}",
        summary: "Get student details by ID",
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", description: "Student ID", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Student details"),
            new OA\Response(response: 404, description: "Student not found or tenant mismatch")
        ]
    )]
    public function show(int $id): JsonResponse|StudentResource
    {
        $studentData = $this->studentRepository->findById($id);
        
        if (!$studentData) {
            return response()->json([
                'message' => 'Student not found.'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return new StudentResource($studentData);
    }

    #[OA\Put(
        path: "/api/admin/eleves/{id}",
        summary: "Update student details",
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", description: "Student ID", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Student updated successfully"),
            new OA\Response(response: 404, description: "Student not found or tenant mismatch")
        ]
    )]
    public function update(StudentRequest $request, int $id): StudentResource
    {
        $student = $this->updateStudentUseCase->execute($id, $request->validated());
        
        return new StudentResource($student);
    }

    #[OA\Delete(
        path: "/api/admin/eleves/{id}",
        summary: "Delete student and credentials",
        tags: ["Students"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", description: "Student ID", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Student deleted successfully"),
            new OA\Response(response: 404, description: "Student not found or tenant mismatch")
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->studentRepository->delete($id);
        
        if (!$deleted) {
            return response()->json([
                'message' => 'Student not found or could not be deleted.'
            ], Response::HTTP_NOT_FOUND);
        }
        
        return response()->json([
            'message' => 'Student deleted successfully.'
        ], Response::HTTP_OK);
    }

    /**
     * Upload or replace a student's avatar photo.
     * Mirrors TeacherController::uploadAvatar.
     */
    public function uploadAvatar(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $eleve = Eleve::find($id);
        if (!$eleve) {
            return response()->json(['message' => 'Student not found.'], Response::HTTP_NOT_FOUND);
        }

        $user = User::find($eleve->user_id ?? null);
        if (!$user) {
            return response()->json(['message' => 'Student user account not found.'], Response::HTTP_NOT_FOUND);
        }

        // Delete old avatar file if it's a stored path (not an external URL)
        if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar and build the full public URL
        $path = $request->file('avatar')->store('avatars', 'public');
        $url  = Storage::disk('public')->url($path);

        $user->avatar = $url;
        $user->save();

        return response()->json([
            'avatar_url' => $url,
            'message'    => 'Avatar uploaded successfully.',
        ]);
    }

    /**
     * Reveal a student's stored plaintext password after verifying admin credentials.
     * Mirrors TeacherController::revealPassword.
     */
    public function revealPassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_password' => 'required|string',
        ]);

        if (!\Hash::check($validated['admin_password'], \Auth::user()->password)) {
            return response()->json(['message' => 'Invalid administrator password.'], 403);
        }

        $eleve = Eleve::find($id);
        if (!$eleve) {
            return response()->json(['message' => 'Student not found.'], 404);
        }

        $user = User::find($eleve->user_id ?? null);
        if (!$user) {
            return response()->json(['message' => 'Student user account not found.'], 404);
        }

        return response()->json([
            'password' => $user->temp_password ?? 'N/A',
        ]);
    }

    /**
     * Update a student's password after verifying admin credentials.
     */
    public function updatePassword(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_password' => 'required|string',
            'new_password'   => 'required|string|max:8',
        ]);

        if (!\Hash::check($validated['admin_password'], \Auth::user()->password)) {
            return response()->json(['message' => 'Invalid administrator password.'], 403);
        }

        $eleve = Eleve::find($id);
        if (!$eleve) {
            return response()->json(['message' => 'Student not found.'], 404);
        }

        $user = User::find($eleve->user_id ?? null);
        if (!$user) {
            return response()->json(['message' => 'Student user account not found.'], 404);
        }

        $user->password      = \Hash::make($validated['new_password']);
        $user->temp_password = $validated['new_password'];
        $user->save();

        return response()->json([
            'message' => 'Student password updated successfully.',
        ]);
    }
}
