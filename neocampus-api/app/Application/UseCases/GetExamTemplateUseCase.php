<?php

namespace App\Application\UseCases;

use App\Domain\Ports\ExamenPortInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GetExamTemplateUseCase
{
    private ExamenPortInterface $examenRepository;

    public function __construct(ExamenPortInterface $examenRepository)
    {
        $this->examenRepository = $examenRepository;
    }

    public function execute(): ?string
    {
        $settings = $this->examenRepository->findSettings();
        if (!$settings || empty($settings['template_sujet_path'])) {
            throw new HttpException(404, "Aucun gabarit officiel n'a été téléversé par l'administration.");
        }

        return $settings['template_sujet_path'];
    }
}
