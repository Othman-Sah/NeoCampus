<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ExamenPortInterface;
use Illuminate\Http\UploadedFile;

class UploadExamSujetUseCase
{
    private ExamenPortInterface $examenRepository;

    public function __construct(ExamenPortInterface $examenRepository)
    {
        $this->examenRepository = $examenRepository;
    }

    public function execute(int $examenId, UploadedFile $file): object
    {
        // Save the file on disk
        $path = $file->store('subjects', 'public');
        
        return $this->examenRepository->uploadSujet($examenId, $path);
    }
}
