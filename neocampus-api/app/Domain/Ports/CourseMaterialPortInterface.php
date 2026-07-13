<?php

namespace App\Domain\Ports;

use App\Models\Support;
use App\Models\Devoir;

interface CourseMaterialPortInterface
{
    public function listSupports(int $classeId, ?int $matiereId = null): array;
    public function createSupport(array $data): Support;
    public function deleteSupport(int $id): bool;

    public function listHomework(int $classeId, ?int $matiereId = null): array;
    public function createHomework(array $data): Devoir;
    public function updateHomework(int $id, array $data): ?Devoir;
    public function deleteHomework(int $id): bool;
}
