<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ExamenPortInterface;

class ReviewExamScheduleUseCase
{
    private ExamenPortInterface $examenRepository;

    public function __construct(ExamenPortInterface $examenRepository)
    {
        $this->examenRepository = $examenRepository;
    }

    public function execute(int $proposalId, string $status, ?string $comment, int $adminUserId): object
    {
        return $this->examenRepository->reviewSchedule($proposalId, $status, $comment, $adminUserId);
    }
}
