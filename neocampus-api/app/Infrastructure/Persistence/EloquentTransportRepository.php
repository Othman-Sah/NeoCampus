<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\TransportPortInterface;
use App\Models\Vehicule;
use App\Models\Chauffeur;
use App\Models\Itineraire;
use App\Models\Eleve;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EloquentTransportRepository implements TransportPortInterface
{
    // Vehicles
    public function listVehicles(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Vehicule::where('etablissement_id', $tenantId)
            ->withCount(['chauffeurs', 'itineraires']);

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('matricule', 'like', "%{$q}%")
                    ->orWhere('marque', 'like', "%{$q}%")
                    ->orWhere('modele', 'like', "%{$q}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        return $query->paginate($perPage);
    }

    public function findVehicle(int $id): ?array
    {
        $vehicle = Vehicule::with(['chauffeurs', 'itineraires'])->find($id);
        return $vehicle ? $vehicle->toArray() : null;
    }

    public function createVehicle(array $data): array
    {
        $vehicle = Vehicule::create($data);
        return $vehicle->toArray();
    }

    public function updateVehicle(int $id, array $data): array
    {
        $vehicle = Vehicule::findOrFail($id);
        $vehicle->update($data);
        return $vehicle->toArray();
    }

    public function deleteVehicle(int $id): bool
    {
        $vehicle = Vehicule::findOrFail($id);
        return (bool)$vehicle->delete();
    }

    // Drivers
    public function listDrivers(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Chauffeur::where('etablissement_id', $tenantId)->with(['vehicule', 'user']);

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('nom', 'like', "%{$q}%")
                    ->orWhere('prenom', 'like', "%{$q}%")
                    ->orWhere('telephone', 'like', "%{$q}%")
                    ->orWhere('num_permis', 'like', "%{$q}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        return $query->paginate($perPage);
    }

    public function findDriver(int $id): ?array
    {
        $driver = Chauffeur::with(['vehicule', 'user'])->find($id);
        return $driver ? $driver->toArray() : null;
    }

    public function createDriver(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $tenantId = \Illuminate\Support\Facades\Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
            if (!$tenantId) {
                throw new \InvalidArgumentException("Tenant context is required to create a driver.");
            }

            $userId = $data['user_id'] ?? null;
            if (!$userId) {
                $email = strtolower($data['prenom'] . '.' . $data['nom'] . '@neocampus.local');
                // Ensure email uniqueness
                $count = 1;
                $originalEmail = $email;
                while (User::where('email', $email)->exists()) {
                    $parts = explode('@', $originalEmail);
                    $email = $parts[0] . $count . '@' . $parts[1];
                    $count++;
                }

                $user = User::create([
                    'etablissement_id' => $tenantId,
                    'nom' => $data['nom'],
                    'prenom' => $data['prenom'],
                    'email' => $email,
                    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                    'role' => 'chauffeur',
                ]);
                $userId = $user->id;
            }

            $driver = Chauffeur::create([
                'etablissement_id' => $tenantId,
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'telephone' => $data['telephone'] ?? null,
                'num_permis' => $data['num_permis'],
                'vehicule_id' => $data['vehicule_id'] ?? null,
                'user_id' => $userId,
                'statut' => $data['statut'] ?? 'actif',
            ]);

            return $driver->load(['vehicule', 'user'])->toArray();
        });
    }

    public function updateDriver(int $id, array $data): array
    {
        $driver = Chauffeur::findOrFail($id);

        return DB::transaction(function () use ($driver, $data) {
            $driver->update($data);

            if ($driver->user_id) {
                $user = User::find($driver->user_id);
                if ($user) {
                    $userUpdate = [];
                    if (isset($data['nom'])) $userUpdate['nom'] = $data['nom'];
                    if (isset($data['prenom'])) $userUpdate['prenom'] = $data['prenom'];
                    if (!empty($userUpdate)) {
                        $user->update($userUpdate);
                    }
                }
            }

            return $driver->load(['vehicule', 'user'])->toArray();
        });
    }

    public function deleteDriver(int $id): bool
    {
        $driver = Chauffeur::findOrFail($id);
        return (bool)$driver->delete();
    }

    public function getAvailableDrivers(int $tenantId): array
    {
        return Chauffeur::where('etablissement_id', $tenantId)
            ->whereNull('vehicule_id')
            ->where('statut', 'actif')
            ->get()
            ->toArray();
    }

    // Routes
    public function listRoutes(int $tenantId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Itineraire::where('etablissement_id', $tenantId)->with(['vehicule', 'eleves.classe']);

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('nom', 'like', "%{$q}%")
                    ->orWhere('zone', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        if (!empty($filters['statut'])) {
            $query->where('statut', $filters['statut']);
        }

        return $query->paginate($perPage);
    }

    public function findRoute(int $id): ?array
    {
        $route = Itineraire::with(['vehicule', 'eleves.user', 'eleves.classe'])->find($id);
        if (!$route) {
            return null;
        }

        // Format students to matching TypeScript entity specifications
        $data = $route->toArray();
        $formattedStudents = [];
        foreach ($route->eleves as $student) {
            $formattedStudents[] = [
                'eleve_id' => $student->id,
                'nom' => $student->nom,
                'prenom' => $student->prenom,
                'classe_nom' => $student->classe->nom ?? $student->classe_nom ?? 'N/A',
                'point_ramassage' => $student->pivot->point_ramassage,
                'latitude' => $student->pivot->latitude ? (float)$student->pivot->latitude : null,
                'longitude' => $student->pivot->longitude ? (float)$student->pivot->longitude : null,
            ];
        }
        $data['students'] = $formattedStudents;
        $data['student_count'] = count($formattedStudents);

        return $data;
    }

    public function createRoute(array $data): array
    {
        $route = Itineraire::create($data);
        return $route->toArray();
    }

    public function updateRoute(int $id, array $data): array
    {
        $route = Itineraire::findOrFail($id);
        $route->update($data);
        return $route->toArray();
    }

    public function deleteRoute(int $id): bool
    {
        $route = Itineraire::findOrFail($id);
        return (bool)$route->delete();
    }

    // Student assignment
    public function assignStudentsToRoute(int $routeId, array $assignments): void
    {
        $route = Itineraire::findOrFail($routeId);

        DB::transaction(function () use ($route, $assignments) {
            // Assignments array items format: ['eleve_id' => 1, 'point_ramassage' => 'Stop', 'latitude' => 35.75, 'longitude' => -5.83]
            $syncData = [];
            foreach ($assignments as $assignment) {
                $studentId = $assignment['eleve_id'];
                $syncData[$studentId] = [
                    'point_ramassage' => $assignment['point_ramassage'] ?? null,
                    'latitude' => $assignment['latitude'] ?? null,
                    'longitude' => $assignment['longitude'] ?? null,
                ];
            }

            // Sync without detaching, or sync. Let's use sync() to set/overwrite
            $route->eleves()->sync($syncData);
        });
    }

    public function removeStudentFromRoute(int $routeId, int $studentId): bool
    {
        $route = Itineraire::findOrFail($routeId);
        return (bool)$route->eleves()->detach($studentId);
    }

    public function getRouteStudents(int $routeId): array
    {
        $route = Itineraire::findOrFail($routeId);
        $students = [];
        foreach ($route->eleves as $student) {
            $students[] = [
                'eleve_id' => $student->id,
                'nom' => $student->nom,
                'prenom' => $student->prenom,
                'classe_nom' => $student->classe->nom ?? $student->classe_nom ?? 'N/A',
                'point_ramassage' => $student->pivot->point_ramassage,
                'latitude' => $student->pivot->latitude ? (float)$student->pivot->latitude : null,
                'longitude' => $student->pivot->longitude ? (float)$student->pivot->longitude : null,
            ];
        }
        return $students;
    }

    public function getStudentRoute(int $studentId): ?array
    {
        $student = Eleve::findOrFail($studentId);
        $route = $student->belongsToMany(Itineraire::class, 'eleve_itineraire', 'eleve_id', 'itineraire_id')
            ->withPivot('point_ramassage', 'latitude', 'longitude')
            ->first();

        if (!$route) {
            return null;
        }

        return [
            'route_id' => $route->id,
            'nom' => $route->nom,
            'zone' => $route->zone,
            'point_ramassage' => $route->pivot->point_ramassage,
            'latitude' => $route->pivot->latitude ? (float)$route->pivot->latitude : null,
            'longitude' => $route->pivot->longitude ? (float)$route->pivot->longitude : null,
        ];
    }

    public function saveStudentRoute(int $studentId, ?int $routeId, ?string $pointRamassage, ?float $latitude, ?float $longitude): void
    {
        $student = Eleve::findOrFail($studentId);

        DB::transaction(function () use ($student, $routeId, $pointRamassage, $latitude, $longitude) {
            // First detach the student from all current routes
            $student->belongsToMany(Itineraire::class, 'eleve_itineraire', 'eleve_id', 'itineraire_id')->detach();

            // If a routeId is provided, attach to the new route
            if ($routeId) {
                $student->belongsToMany(Itineraire::class, 'eleve_itineraire', 'eleve_id', 'itineraire_id')
                    ->attach($routeId, [
                        'point_ramassage' => $pointRamassage,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                    ]);
            }
        });
    }

    // Driver-specific queries
    public function getDriverRouteAndStudents(int $userId): ?array
    {
        // 1. Find the driver linked to the user account
        $driver = Chauffeur::where('user_id', $userId)->first();
        if (!$driver || !$driver->vehicule_id) {
            return null;
        }

        // 2. Find the active route associated with the driver's vehicle
        $route = Itineraire::where('vehicule_id', $driver->vehicule_id)
            ->where('statut', 'actif')
            ->with(['vehicule', 'eleves.classe'])
            ->first();

        if (!$route) {
            return null;
        }

        // 3. Transform and return
        return $this->findRoute($route->id);
    }
}
