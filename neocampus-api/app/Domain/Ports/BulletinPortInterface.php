<?php

namespace App\Domain\Ports;

interface BulletinPortInterface
{
    /**
     * Bulk generate bulletins for a class and period.
     */
    public function generateBulk(int $classeId, string $periode): array;
}
