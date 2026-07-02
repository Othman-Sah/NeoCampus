<?php

namespace App\Application\UseCases;

use App\Application\DTOs\RequestNoteExceptionDTO;
use App\Domain\Ports\GradePortInterface;
use App\Models\Enseignant;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RequestNoteExceptionUseCase
{
    private GradePortInterface $gradeRepository;

    public function __construct(GradePortInterface $gradeRepository)
    {
        $this->gradeRepository = $gradeRepository;
    }

    public function execute(RequestNoteExceptionDTO $dto, int $userId): object
    {
        $teacher = Enseignant::where('user_id', $userId)->first();
        if (!$teacher) {
            throw new HttpException(403, "Seuls les enseignants peuvent demander des exceptions de saisie.");
        }

        return $this->gradeRepository->requestException($teacher->id, $dto->examen_id, $dto->motif);
    }
}
