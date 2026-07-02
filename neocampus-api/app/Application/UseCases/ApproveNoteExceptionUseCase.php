<?php

namespace App\Application\UseCases;

use App\Domain\Ports\GradePortInterface;

class ApproveNoteExceptionUseCase
{
    private GradePortInterface $gradeRepository;

    public function __construct(GradePortInterface $gradeRepository)
    {
        $this->gradeRepository = $gradeRepository;
    }

    public function execute(int $exceptionId, int $adminUserId): object
    {
        return $this->gradeRepository->approveException($exceptionId, $adminUserId);
    }
}
