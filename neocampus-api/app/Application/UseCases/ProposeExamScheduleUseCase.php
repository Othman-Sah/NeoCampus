<?php

namespace App\Application\UseCases;

use App\Application\DTOs\ProposeExamScheduleDTO;
use App\Domain\Ports\ExamenPortInterface;
use App\Models\Enseignant;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProposeExamScheduleUseCase
{
    private ExamenPortInterface $examenRepository;

    public function __construct(ExamenPortInterface $examenRepository)
    {
        $this->examenRepository = $examenRepository;
    }

    public function execute(ProposeExamScheduleDTO $dto, int $userId): array
    {
        // 1. Verify if teacher proposing dates is allowed (i.e. force_admin_schedule = false)
        $settings = $this->examenRepository->findSettings();
        if ($settings && $settings['force_admin_schedule']) {
            throw new HttpException(403, "Seul l'administration peut planifier les examens selon les règles en vigueur.");
        }

        $teacher = Enseignant::where('user_id', $userId)->first();
        if (!$teacher) {
            throw new HttpException(403, "Profil enseignant requis pour proposer un planning d'examen.");
        }

        return $this->examenRepository->proposeSchedule($teacher->id, $dto->toArray());
    }
}
