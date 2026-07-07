<?php

namespace App\Application\UseCases;

use App\Domain\Ports\BulletinPortInterface;
use App\Models\User;
use App\Models\Eleve;
use Symfony\Component\HttpKernel\Exception\HttpException;

class GetBulletinUseCase
{
    private BulletinPortInterface $bulletinRepository;

    public function __construct(BulletinPortInterface $bulletinRepository)
    {
        $this->bulletinRepository = $bulletinRepository;
    }

    public function execute(string $bulletinId, int $userId): ?array
    {
        $bulletin = $this->bulletinRepository->findWithDetails($bulletinId);

        if (!$bulletin) {
            return null;
        }

        $user = User::findOrFail($userId);

        // Security check per role
        if ($user->role === 'eleve') {
            $student = Eleve::where('user_id', $user->id)->first();
            if (!$student || $student->id !== $bulletin['eleve_id']) {
                throw new HttpException(403, "Accès interdit : Vous ne pouvez consulter que vos propres bulletins.");
            }
        } elseif ($user->role === 'parent') {
            $student = Eleve::find($bulletin['eleve_id']);
            $parentEmail = strtolower($user->email);
            $studentParentEmail = isset($student->parent_contact['email']) ? strtolower($student->parent_contact['email']) : null;

            if ($studentParentEmail !== $parentEmail) {
                throw new HttpException(403, "Accès interdit : Ce bulletin ne concerne pas l'un de vos enfants.");
            }
        } elseif (!in_array($user->role, ['admin', 'enseignant'])) {
            throw new HttpException(403, "Rôle non autorisé pour cette opération.");
        }

        return $bulletin;
    }
}
