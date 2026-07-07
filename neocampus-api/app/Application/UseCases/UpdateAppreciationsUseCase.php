<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;
use App\Models\Enseignant;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UpdateAppreciationsUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(string $bulletinId, int $matiereId, string $appreciation, int $userId): void
    {
        $user = User::findOrFail($userId);
        $teacherId = null;

        if ($user->role === 'enseignant') {
            $teacher = Enseignant::where('user_id', $user->id)->first();
            if (!$teacher) {
                throw new HttpException(403, "Profil enseignant introuvable pour cet utilisateur.");
            }
            $teacherId = $teacher->id;
        }

        $this->bulletinRepository->updateAppreciations($bulletinId, $matiereId, $appreciation, $teacherId);
    }
}
