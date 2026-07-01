<?php

namespace App\Domain\Ports;

use App\Domain\Models\Teacher;

interface TeacherPortInterface
{
    public function findById(int $id): ?Teacher;

    /** @return Teacher[] */
    public function findAll(array $filters = []): array;

    public function create(array $data): Teacher;
    public function update(int $id, array $data): Teacher;
    public function delete(int $id): bool;

    // Assignment & Workload support
    public function assignToClassAndSubject(int $teacherId, int $classId, int $subjectId): bool;
    public function getAssignments(int $teacherId): array;
    public function removeAssignment(int $teacherId, int $classId, int $subjectId): bool;
    
    // Subjects/Matieres support
    public function findAllSubjects(): array;
}
