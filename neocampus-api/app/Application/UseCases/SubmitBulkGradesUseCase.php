<?php

namespace App\Application\UseCases;

use App\Application\DTOs\BulkGradesDTO;
use App\Domain\Ports\GradePortInterface;
use App\Domain\Ports\ExamenPortInterface;
use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SubmitBulkGradesUseCase
{
    private GradePortInterface $gradeRepository;
    private ExamenPortInterface $examenRepository;

    public function __construct(GradePortInterface $gradeRepository, ExamenPortInterface $examenRepository)
    {
        $this->gradeRepository = $gradeRepository;
        $this->examenRepository = $examenRepository;
    }

    public function execute(BulkGradesDTO $dto, int $userId): array
    {
        $user = User::findOrFail($userId);

        // Security check for non-admin users (teachers)
        if ($user->role !== 'admin') {
            $teacher = Enseignant::where('user_id', $user->id)->first();
            if (!$teacher) {
                throw new HttpException(403, "You do not have a teacher profile linked to your user account.");
            }

            // 1. Retrieve settings
            $settings = $this->examenRepository->findSettings();
            $now = now();
            $withinWindow = false;

            if ($settings) {
                $start = \Carbon\Carbon::parse($settings['periode_saisie_notes_debut']);
                $end = \Carbon\Carbon::parse($settings['periode_saisie_notes_fin']);
                $withinWindow = $now->between($start, $end);
            }

            // 2. If outside window, check for approved exception
            if (!$withinWindow) {
                $hasException = $this->gradeRepository->hasActiveException($teacher->id, $dto->examen_id);
                if (!$hasException) {
                    throw new HttpException(403, "Saisie verrouillée : la période de saisie est dépassée et vous ne disposez pas d'une exception approuvée.");
                }
            }
        }

        $gradesArray = array_map(fn($n) => $n->toArray(), $dto->notes);
        return $this->gradeRepository->submitBulk($dto->examen_id, $gradesArray);
    }
}
