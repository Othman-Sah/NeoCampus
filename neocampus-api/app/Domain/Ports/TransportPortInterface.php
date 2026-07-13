<?php

namespace App\Domain\Ports;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TransportPortInterface
{
    // Vehicles
    public function listVehicles(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findVehicle(int $id): ?array;
    public function createVehicle(array $data): array;
    public function updateVehicle(int $id, array $data): array;
    public function deleteVehicle(int $id): bool;

    // Drivers
    public function listDrivers(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findDriver(int $id): ?array;
    public function createDriver(array $data): array;
    public function updateDriver(int $id, array $data): array;
    public function deleteDriver(int $id): bool;
    public function getAvailableDrivers(int $tenantId): array;

    // Routes
    public function listRoutes(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function findRoute(int $id): ?array;
    public function createRoute(array $data): array;
    public function updateRoute(int $id, array $data): array;
    public function deleteRoute(int $id): bool;

    // Student assignment
    public function assignStudentsToRoute(int $routeId, array $assignments): void;
    public function removeStudentFromRoute(int $routeId, int $studentId): bool;
    public function getRouteStudents(int $routeId): array;
    public function getStudentRoute(int $studentId): ?array;
    public function saveStudentRoute(int $studentId, ?int $routeId, ?string $pointRamassage, ?float $latitude, ?float $longitude): void;
    
    // Driver-specific queries
    public function getDriverRouteAndStudents(int $userId): ?array;
}
