<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Application\DTOs\CreateAnnouncementDTO;
use App\Application\DTOs\UpdateAnnouncementDTO;
use App\Application\UseCases\Announcements\ListAnnouncementsUseCase;
use App\Application\UseCases\Announcements\CreateAnnouncementUseCase;
use App\Application\UseCases\Announcements\UpdateAnnouncementUseCase;
use App\Application\UseCases\Announcements\DeleteAnnouncementUseCase;
use App\Application\UseCases\Announcements\TogglePinAnnouncementUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Annonce;

/**
 * @OA\Tag(
 *     name="Announcements Management",
 *     description="Endpoints for school announcements and role-targeted notice boards"
 * )
 */
class AnnouncementController extends Controller
{
    public function __construct(
        private ListAnnouncementsUseCase $listAnnouncements,
        private CreateAnnouncementUseCase $createAnnouncement,
        private UpdateAnnouncementUseCase $updateAnnouncement,
        private DeleteAnnouncementUseCase $deleteAnnouncement,
        private TogglePinAnnouncementUseCase $togglePinAnnouncement
    ) {}

    /**
     * @OA\Get(
     *     path="/api/annonces",
     *     summary="List targeted announcements",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $role = $request->user()->role;
        $perPage = min($request->integer('per_page', 15), 100);

        $announcements = $this->listAnnouncements->execute($tenantId, $role, $perPage);
        return AnnouncementResource::collection($announcements)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/annonces",
     *     summary="Create new announcement",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function store(AnnouncementRequest $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $userId = $request->user()->id;
        $dto = CreateAnnouncementDTO::fromArray($request->validated());

        $announcement = $this->createAnnouncement->execute($dto, $tenantId, $userId);
        return (new AnnouncementResource($announcement))->response()->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/annonces/{id}",
     *     summary="Get announcement details",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function show(int $id): JsonResponse
    {
        $announcement = Annonce::with('user')->findOrFail($id);
        return (new AnnouncementResource($announcement))->response();
    }

    /**
     * @OA\Put(
     *     path="/api/annonces/{id}",
     *     summary="Update announcement details",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function update(AnnouncementRequest $request, int $id): JsonResponse
    {
        $dto = UpdateAnnouncementDTO::fromArray($request->validated());
        $announcement = $this->updateAnnouncement->execute($id, $dto);
        return (new AnnouncementResource($announcement))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/annonces/{id}",
     *     summary="Delete announcement",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $this->deleteAnnouncement->execute($id);
        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    /**
     * @OA\Put(
     *     path="/api/annonces/{id}/pin",
     *     summary="Toggle pinned state",
     *     tags={"Announcements Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function togglePin(int $id): JsonResponse
    {
        $announcement = $this->togglePinAnnouncement->execute($id);
        return (new AnnouncementResource($announcement))->response();
    }
}
