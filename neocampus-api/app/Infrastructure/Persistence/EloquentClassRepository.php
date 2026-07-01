<?php

namespace App\Infrastructure\Persistence;

use App\Domain\Ports\ClassPortInterface;
use App\Models\Classe;
use App\Models\Section;
use App\Models\AnneeScolaire;
use Illuminate\Support\Facades\Auth;

class EloquentClassRepository implements ClassPortInterface
{
    public function findById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $class = Classe::withCount(['eleves', 'enseignants'])
            ->where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$class) return null;

        $data = $class->toArray();
        $data['students_count'] = $class->eleves_count;
        $data['teachers_count'] = $class->enseignants_count;
        return $data;
    }

    public function findAll(array $filters = []): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        $query = Classe::withCount(['eleves', 'enseignants'])
            ->where('etablissement_id', $tenantId);

        if (!empty($filters['section_id'])) {
            $query->where('section_id', $filters['section_id']);
        }
        if (!empty($filters['annee_scolaire_id'])) {
            $query->where('annee_scolaire_id', $filters['annee_scolaire_id']);
        }
        if (!empty($filters['search'])) {
            $query->where('nom', 'like', '%' . $filters['search'] . '%');
        }

        return $query->get()->map(function ($class) {
            $data = $class->toArray();
            $data['students_count'] = $class->eleves_count;
            $data['teachers_count'] = $class->enseignants_count;
            return $data;
        })->toArray();
    }

    public function create(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a class.");
        }

        $class = Classe::create([
            'etablissement_id' => $tenantId,
            'nom' => $data['nom'],
            'niveau' => $data['niveau'] ?? null,
            'section_id' => $data['section_id'],
            'annee_scolaire_id' => $data['annee_scolaire_id'],
        ]);

        return $this->findById($class->id);
    }

    public function update(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a class.");
        }

        $class = Classe::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $class->update(array_filter([
            'nom' => $data['nom'] ?? null,
            'niveau' => $data['niveau'] ?? null,
            'section_id' => $data['section_id'] ?? null,
            'annee_scolaire_id' => $data['annee_scolaire_id'] ?? null,
        ], function ($value) {
            return !is_null($value);
        }));

        return $this->findById($class->id);
    }

    public function delete(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $class = Classe::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$class) return false;

        return (bool) $class->delete();
    }

    public function findSectionById(int $id): ?array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return null;

        $section = Section::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        return $section ? $section->toArray() : null;
    }

    public function findAllSections(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return Section::where('etablissement_id', $tenantId)->get()->toArray();
    }

    public function createSection(array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? $data['etablissement_id'] ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to create a section.");
        }

        $section = Section::create([
            'etablissement_id' => $tenantId,
            'nom' => $data['nom'],
        ]);

        return $section->toArray();
    }

    public function updateSection(int $id, array $data): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required to update a section.");
        }

        $section = Section::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        $section->update(array_filter([
            'nom' => $data['nom'] ?? null,
        ], function ($value) {
            return !is_null($value);
        }));

        return $section->toArray();
    }

    public function deleteSection(int $id): bool
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return false;

        $section = Section::where('id', $id)
            ->where('etablissement_id', $tenantId)
            ->first();

        if (!$section) return false;

        return (bool) $section->delete();
    }

    public function findAllAcademicYears(): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) return [];

        return AnneeScolaire::where('etablissement_id', $tenantId)->get()->toArray();
    }
}
