<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PlatformSettingRepositoryInterface;
use App\Application\DTOs\PlatformSettingDTO;
use App\Application\Services\AuditService;
use Illuminate\Http\Request;

class UpdatePlatformSettingUseCase
{
    private PlatformSettingRepositoryInterface $repository;
    private AuditService $auditService;

    public function __construct(PlatformSettingRepositoryInterface $repository, AuditService $auditService)
    {
        $this->repository = $repository;
        $this->auditService = $auditService;
    }

    public function execute(Request $request, PlatformSettingDTO $dto): void
    {
        $this->repository->set($dto->key, $dto->value);

        $this->auditService->record($request, 'platform_config_updated', 'platform', null, [
            'config_key' => $dto->key,
            'updated_keys' => array_keys($dto->value),
        ]);
    }
}
