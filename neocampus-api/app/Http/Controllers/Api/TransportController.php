<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VehicleRequest;
use App\Http\Requests\DriverRequest;
use App\Http\Requests\RouteRequest;
use App\Http\Requests\AssignStudentsToRouteRequest;
use App\Http\Resources\VehicleResource;
use App\Http\Resources\DriverResource;
use App\Http\Resources\RouteResource;
use App\Application\DTOs\CreateVehicleDTO;
use App\Application\DTOs\UpdateVehicleDTO;
use App\Application\DTOs\CreateDriverDTO;
use App\Application\DTOs\UpdateDriverDTO;
use App\Application\DTOs\CreateRouteDTO;
use App\Application\DTOs\UpdateRouteDTO;
use App\Application\UseCases\Transport\ListVehiclesUseCase;
use App\Application\UseCases\Transport\CreateVehicleUseCase;
use App\Application\UseCases\Transport\UpdateVehicleUseCase;
use App\Application\UseCases\Transport\DeleteVehicleUseCase;
use App\Application\UseCases\Transport\ListDriversUseCase;
use App\Application\UseCases\Transport\CreateDriverUseCase;
use App\Application\UseCases\Transport\UpdateDriverUseCase;
use App\Application\UseCases\Transport\DeleteDriverUseCase;
use App\Application\UseCases\Transport\GetAvailableDriversUseCase;
use App\Application\UseCases\Transport\ListRoutesUseCase;
use App\Application\UseCases\Transport\CreateRouteUseCase;
use App\Application\UseCases\Transport\UpdateRouteUseCase;
use App\Application\UseCases\Transport\DeleteRouteUseCase;
use App\Application\UseCases\Transport\AssignStudentsToRouteUseCase;
use App\Application\UseCases\Transport\GetDriverRouteDetailsUseCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Vehicule;
use App\Models\Chauffeur;
use App\Models\Itineraire;

/**
 * @OA\Tag(
 *     name="Transport Management",
 *     description="Endpoints for school fleet, drivers, routes, and coordinates tracking"
 * )
 */
class TransportController extends Controller
{
    public function __construct(
        private ListVehiclesUseCase $listVehicles,
        private CreateVehicleUseCase $createVehicle,
        private UpdateVehicleUseCase $updateVehicle,
        private DeleteVehicleUseCase $deleteVehicle,
        private ListDriversUseCase $listDrivers,
        private CreateDriverUseCase $createDriver,
        private UpdateDriverUseCase $updateDriver,
        private DeleteDriverUseCase $deleteDriver,
        private GetAvailableDriversUseCase $getAvailableDrivers,
        private ListRoutesUseCase $listRoutes,
        private CreateRouteUseCase $createRoute,
        private UpdateRouteUseCase $updateRoute,
        private DeleteRouteUseCase $deleteRoute,
        private AssignStudentsToRouteUseCase $assignStudentsToRoute,
        private GetDriverRouteDetailsUseCase $getDriverRouteDetails
    ) {}

    // --- Vehicles ---

    /**
     * @OA\Get(
     *     path="/api/transport/vehicules",
     *     summary="List vehicles",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function indexVehicles(Request $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $perPage = min($request->integer('per_page', 15), 100);
        $filters = $request->only(['q', 'statut']);

        $vehicles = $this->listVehicles->execute($tenantId, $filters, $perPage);
        return VehicleResource::collection($vehicles)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/transport/vehicules",
     *     summary="Create vehicle",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function storeVehicle(VehicleRequest $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $dto = CreateVehicleDTO::fromArray($request->validated());

        $vehicle = $this->createVehicle->execute($dto, $tenantId);
        return (new VehicleResource($vehicle))->response()->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/transport/vehicules/{id}",
     *     summary="Get vehicle details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function showVehicle(int $id): JsonResponse
    {
        // Enforce implicit tenant check via findOrFail on Eloquent before exposing array
        $vehicle = Vehicule::with(['chauffeurs', 'itineraires'])->findOrFail($id);
        return (new VehicleResource($vehicle))->response();
    }

    /**
     * @OA\Put(
     *     path="/api/transport/vehicules/{id}",
     *     summary="Update vehicle details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function updateVehicle(VehicleRequest $request, int $id): JsonResponse
    {
        $dto = UpdateVehicleDTO::fromArray($request->validated());
        $vehicle = $this->updateVehicle->execute($id, $dto);
        return (new VehicleResource($vehicle))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/transport/vehicules/{id}",
     *     summary="Delete vehicle",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function destroyVehicle(int $id): JsonResponse
    {
        $this->deleteVehicle->execute($id);
        return response()->json(['message' => 'Vehicle deleted successfully.']);
    }

    // --- Drivers ---

    /**
     * @OA\Get(
     *     path="/api/transport/chauffeurs",
     *     summary="List drivers",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function indexDrivers(Request $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $perPage = min($request->integer('per_page', 15), 100);
        $filters = $request->only(['q', 'statut']);

        $drivers = $this->listDrivers->execute($tenantId, $filters, $perPage);
        return DriverResource::collection($drivers)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/transport/chauffeurs/available",
     *     summary="Get active drivers without vehicles",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function availableDrivers(Request $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $drivers = $this->getAvailableDrivers->execute($tenantId);
        return DriverResource::collection($drivers)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/transport/chauffeurs",
     *     summary="Create driver",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function storeDriver(DriverRequest $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $dto = CreateDriverDTO::fromArray($request->validated());

        $driver = $this->createDriver->execute($dto, $tenantId);
        return (new DriverResource($driver))->response()->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/transport/chauffeurs/{id}",
     *     summary="Get driver details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function showDriver(int $id): JsonResponse
    {
        $driver = Chauffeur::with(['vehicule', 'user'])->findOrFail($id);
        return (new DriverResource($driver))->response();
    }

    /**
     * @OA\Put(
     *     path="/api/transport/chauffeurs/{id}",
     *     summary="Update driver details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function updateDriver(DriverRequest $request, int $id): JsonResponse
    {
        $dto = UpdateDriverDTO::fromArray($request->validated());
        $driver = $this->updateDriver->execute($id, $dto);
        return (new DriverResource($driver))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/transport/chauffeurs/{id}",
     *     summary="Delete driver",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function destroyDriver(int $id): JsonResponse
    {
        $this->deleteDriver->execute($id);
        return response()->json(['message' => 'Driver deleted successfully.']);
    }

    // --- Routes ---

    /**
     * @OA\Get(
     *     path="/api/transport/itineraires",
     *     summary="List routes",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function indexRoutes(Request $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $perPage = min($request->integer('per_page', 15), 100);
        $filters = $request->only(['q', 'statut']);

        $routes = $this->listRoutes->execute($tenantId, $filters, $perPage);
        return RouteResource::collection($routes)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/transport/itineraires",
     *     summary="Create route",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function storeRoute(RouteRequest $request): JsonResponse
    {
        $tenantId = $request->user()->etablissement_id;
        $dto = CreateRouteDTO::fromArray($request->validated());

        $route = $this->createRoute->execute($dto, $tenantId);
        return (new RouteResource($route))->response()->setStatusCode(201);
    }

    /**
     * @OA\Get(
     *     path="/api/transport/itineraires/{id}",
     *     summary="Get route details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function showRoute(int $id): JsonResponse
    {
        // Fetch via Itineraire directly first to validate tenant scope
        Itineraire::findOrFail($id);

        // Fetch formatted details
        $route = $this->listRoutes->execute(request()->user()->etablissement_id, [], 1) // placeholder to load repository
            ->getCollection(); // we use repository find instead:
        
        $repository = resolve(TransportPortInterface::class);
        $routeData = $repository->findRoute($id);

        return response()->json(['data' => $routeData]);
    }

    /**
     * @OA\Put(
     *     path="/api/transport/itineraires/{id}",
     *     summary="Update route details",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function updateRoute(RouteRequest $request, int $id): JsonResponse
    {
        $dto = UpdateRouteDTO::fromArray($request->validated());
        $route = $this->updateRoute->execute($id, $dto);
        return (new RouteResource($route))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/transport/itineraires/{id}",
     *     summary="Delete route",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function destroyRoute(int $id): JsonResponse
    {
        $this->deleteRoute->execute($id);
        return response()->json(['message' => 'Route deleted successfully.']);
    }

    // --- Student Assignment ---

    /**
     * @OA\Post(
     *     path="/api/transport/itineraires/{id}/assign",
     *     summary="Assign students to route",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function assignStudents(AssignStudentsToRouteRequest $request, int $id): JsonResponse
    {
        // Enforce tenant boundary
        Itineraire::findOrFail($id);

        $this->assignStudentsToRoute->execute($id, $request->input('assignments'));
        return response()->json(['message' => 'Students assigned to route successfully.']);
    }

    /**
     * @OA\Delete(
     *     path="/api/transport/itineraires/{routeId}/students/{studentId}",
     *     summary="Remove student from route",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function removeStudent(int $routeId, int $studentId): JsonResponse
    {
        // Enforce tenant boundary
        Itineraire::findOrFail($routeId);

        $repository = resolve(TransportPortInterface::class);
        $repository->removeStudentFromRoute($routeId, $studentId);

        return response()->json(['message' => 'Student removed from route successfully.']);
    }

    // --- Driver dashboard ---

    /**
     * @OA\Get(
     *     path="/api/transport/driver-route",
     *     summary="Get route details for driver",
     *     tags={"Transport Management"},
     *     security={{"sanctum":{}}}
     * )
     */
    public function driverRoute(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $routeData = $this->getDriverRouteDetails->execute($userId);

        if (!$routeData) {
            return response()->json(['data' => null, 'message' => 'No active route found for this driver.'], 200);
        }

        return response()->json(['data' => $routeData]);
    }

    public function getStudentRoute(int $studentId): JsonResponse
    {
        $repository = resolve(\App\Domain\Ports\TransportPortInterface::class);
        $routeInfo = $repository->getStudentRoute($studentId);
        return response()->json(['data' => $routeInfo]);
    }

    public function saveStudentRoute(Request $request, int $studentId): JsonResponse
    {
        $request->validate([
            'itineraire_id' => 'nullable|integer',
            'point_ramassage' => 'nullable|string|max:200',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $repository = resolve(\App\Domain\Ports\TransportPortInterface::class);
        $repository->saveStudentRoute(
            $studentId,
            $request->input('itineraire_id'),
            $request->input('point_ramassage'),
            $request->input('latitude') ? (float)$request->input('latitude') : null,
            $request->input('longitude') ? (float)$request->input('longitude') : null
        );

        return response()->json(['message' => 'Student transport route updated successfully.']);
    }
}
