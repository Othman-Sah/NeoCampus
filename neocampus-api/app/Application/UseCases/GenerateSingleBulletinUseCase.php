<?php

namespace App\Application\UseCases;

use App\Application\DTOs\GenerateSingleBulletinDTO;
use App\Domain\Ports\BulletinPortInterface;
use App\Models\Examen;
use App\Models\Bulletin;
use App\Models\Eleve;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Auth;

class GenerateSingleBulletinUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(GenerateSingleBulletinDTO $dto): string
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        $student = Eleve::where('id', $dto->eleve_id)
            ->where('etablissement_id', $tenantId)
            ->firstOrFail();

        // 1. Check if the bulletin is already PUBLISHED
        $publishedExists = Bulletin::where('eleve_id', $dto->eleve_id)
            ->where('periode', $dto->periode)
            ->where('annee_scolaire', $dto->annee_scolaire)
            ->where('etablissement_id', $tenantId)
            ->where('status', 'PUBLISHED')
            ->exists();

        if ($publishedExists) {
            throw new HttpException(400, "Opération impossible : Le bulletin de cet élève pour cette période est déjà publié.");
        }

        // 2. Pre-flight check: find any exams for this class and period that are NOT completed
        $incompleteExams = Examen::where('classe_id', $student->classe_id)
            ->where('periode', $dto->periode)
            ->where('etablissement_id', $tenantId)
            ->where('status', '!=', 'completed')
            ->get();

        if ($incompleteExams->isNotEmpty()) {
            $examNames = $incompleteExams->pluck('intitule')->implode(', ');
            throw new HttpException(400, "Saisie incomplète : Les examens suivants ne sont pas encore terminés : {$examNames}.");
        }

        return $this->bulletinRepository->generateSingle($dto->eleve_id, $dto->periode, $dto->annee_scolaire);
    }
}
