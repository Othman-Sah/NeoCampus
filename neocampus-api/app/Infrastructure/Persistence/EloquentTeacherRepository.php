<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\TeacherPortInterface;
use App\Domain\Models\Teacher;
use App\Models\Enseignant;
use App\Models\User;
use App\Models\Matiere;
use App\Models\ChargeHoraire;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EloquentTeacherRepository implements TeacherPortInterface
{
    public function findById(int $id): ?Teacher
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $teacher = Enseignant::with(['user', 'chargeHoraires.classe', 'chargeHoraires.matiere'])
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$teacher) return null;

        return Teacher::fromModel($teacher);
    }

    /** @return Teacher[] */
    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = Enseignant::with(['user', 'chargeHoraires.classe', 'chargeHoraires.matiere'])
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('nom', 'like', $search)
                  ->orWhere('prenom', 'like', $search);
            });
        }

        if (!empty($filters['specialite'])) {
            $query->where('specialite', $filters['specialite']);
        }

        return $query->get()->map(function ($t) {
            return Teacher::fromModel($t);
        })->toArray();
    }

    public function create(array $data): Teacher
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a teacher.");
        }

        return DB::transaction(function () use ($data, $tenantId) {
            // 1. Create a User login credentials for this teacher
            $user = User::create([
                'etablissement_id' => $tenantId,
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'TeacherPass123!'),
                'role' => 'enseignant',
                'avatar' => $data['avatar'] ?? null,
                'temp_password' => $data['password'] ?? 'TeacherPass123!',
            ]);

            // 2. Create the Teacher record
            $teacher = Enseignant::create([
                'etablissement_id' => $tenantId,
                'user_id' => $user->id,
                'specialite' => $data['specialite'],
                'salaire_de_base' => $data['salaire_de_base'] ?? 0.00,
            ]);

            // 3. Handle assignments if provided
            if (!empty($data['classes'])) {
                foreach ($data['classes'] as $assignment) {
                    $classId = $assignment['classe_id'] ?? null;
                    $subjectId = $assignment['matiere_id'] ?? null;
                    if ($classId && $subjectId) {
                        $this->assignToClassAndSubject($teacher->id, $classId, $subjectId);
                    }
                }
            }

            // Reload with relations for DTO conversion
            $teacher->load(['user', 'chargeHoraires.classe', 'chargeHoraires.matiere']);
            return Teacher::fromModel($teacher);
        });
    }

    public function update(int $id, array $data): Teacher
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a teacher.");
        }

        $teacher = Enseignant::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        return DB::transaction(function () use ($teacher, $data) {
            // 1. Update the User profile
            if ($teacher->user_id) {
                $user = User::find($teacher->user_id);
                if ($user) {
                    $userUpdate = [];
                    if (isset($data['nom'])) $userUpdate['nom'] = $data['nom'];
                    if (isset($data['prenom'])) $userUpdate['prenom'] = $data['prenom'];
                    if (isset($data['email'])) $userUpdate['email'] = $data['email'];
                    if (isset($data['avatar'])) $userUpdate['avatar'] = $data['avatar'];
                    if (isset($data['password']) && !empty($data['password'])) {
                        $userUpdate['password'] = Hash::make($data['password']);
                        $userUpdate['temp_password'] = $data['password'];
                    }
                    
                    if (!empty($userUpdate)) {
                        $user->update($userUpdate);
                    }
                }
            }

            // 2. Update Teacher fields
            $teacher->update(array_filter([
                'specialite' => $data['specialite'] ?? null,
                'salaire_de_base' => $data['salaire_de_base'] ?? null,
            ], function ($value) {
                return !is_null($value);
            }));

            // 3. Sync assignments if provided
            if (isset($data['classes'])) {
                // Remove all existing assignments first
                ChargeHoraire::where('enseignant_id', $teacher->id)->delete();
                
                foreach ($data['classes'] as $assignment) {
                    if (is_numeric($assignment)) {
                        $sub = Matiere::first();
                        if ($sub) {
                            $this->assignToClassAndSubject($teacher->id, (int)$assignment, $sub->id);
                        }
                    } else {
                        $classId = $assignment['classe_id'] ?? null;
                        $subjectId = $assignment['matiere_id'] ?? null;
                        if ($classId) {
                            if (!$subjectId) {
                                $sub = Matiere::first();
                                $subjectId = $sub ? $sub->id : null;
                            }
                            if ($subjectId) {
                                $this->assignToClassAndSubject($teacher->id, (int)$classId, (int)$subjectId);
                            }
                        }
                    }
                }
            }

            // Reload with relations for DTO conversion
            $teacher->load(['user', 'chargeHoraires.classe', 'chargeHoraires.matiere']);
            return Teacher::fromModel($teacher);
        });
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $teacher = Enseignant::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$teacher) return false;

        return DB::transaction(function () use ($teacher) {
            if ($teacher->user_id) {
                User::where('id', $teacher->user_id)->delete();
            }
            return (bool) $teacher->delete();
        });
    }

    public function assignToClassAndSubject(int $teacherId, int $classId, int $subjectId): bool
    {
        ChargeHoraire::firstOrCreate([
            'enseignant_id' => $teacherId,
            'matiere_id' => $subjectId,
            'classe_id' => $classId,
        ]);

        return true;
    }

    public function getAssignments(int $teacherId): array
    {
        return ChargeHoraire::with(['classe', 'matiere'])
            ->where('enseignant_id', $teacherId)
            ->get()
            ->toArray();
    }

    public function removeAssignment(int $teacherId, int $classId, int $subjectId): bool
    {
        return (bool) ChargeHoraire::where('enseignant_id', $teacherId)
            ->where('classe_id', $classId)
            ->where('matiere_id', $subjectId)
            ->delete();
    }

    public function findAllSubjects(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return Matiere::where('etablissement_id', $tenantId)->get()->toArray();
    }
}
