<?php

namespace App\Application\UseCases;

use App\Application\DTOs\GenerateBulletinDTO;
use App\Domain\Ports\BulletinPortInterface;
use App\Models\Examen;
use App\Models\Bulletin;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Support\Facades\Auth;

class GenerateBulletinsUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(GenerateBulletinDTO $dto): array
    {
        $tenantId = Auth::user()->etablissement_id ?? null;
        if (!$tenantId) {
            throw new \InvalidArgumentException("Tenant context is required.");
        }

        // Verify class exists and belongs to the tenant
        $classe = \App\Models\Classe::find($dto->classe_id);
        if (!$classe) {
            throw new HttpException(404, "Classe introuvable.");
        }

        // 1. Check if any bulletin for this class and period is already PUBLISHED
        $publishedExists = Bulletin::where('classe_id', $dto->classe_id)
            ->where('periode', $dto->periode)
            ->where('annee_scolaire', $dto->annee_scolaire)
            ->where('etablissement_id', $tenantId)
            ->where('status', 'PUBLISHED')
            ->exists();

        if ($publishedExists) {
            throw new HttpException(400, "Opération impossible : Les bulletins de cette classe pour cette période sont déjà publiés.");
        }

        // 2. Pre-flight check: find any exams for this class and period that are NOT completed
        $incompleteExams = Examen::where('classe_id', $dto->classe_id)
            ->where('periode', $dto->periode)
            ->where('etablissement_id', $tenantId)
            ->where('status', '!=', 'completed')
            ->get();

        if ($incompleteExams->isNotEmpty()) {
            $examNames = $incompleteExams->pluck('intitule')->implode(', ');
            throw new HttpException(400, "Saisie incomplète : Les examens suivants ne sont pas encore terminés : {$examNames}.");
        }

        // 3. Check if there are any exams at all
        $totalExamsCount = Examen::where('classe_id', $dto->classe_id)
            ->where('periode', $dto->periode)
            ->where('etablissement_id', $tenantId)
            ->count();

        if ($totalExamsCount === 0) {
            throw new HttpException(400, "Aucune épreuve trouvée pour cette classe durant cette période.");
        }

        return $this->bulletinRepository->generateBulk($dto->classe_id, $dto->periode, $dto->annee_scolaire);
    }
}
