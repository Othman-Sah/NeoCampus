<?php

namespace App\Application\UseCases;

use App\Domain\Ports\SalaryPortInterface;

class ManageSalaryUseCase
{
    private SalaryPortInterface $salaryRepository;

    public function __construct(SalaryPortInterface $salaryRepository)
    {
        $this->salaryRepository = $salaryRepository;
    }

    public function list(array $filters = []): array
    {
        return $this->salaryRepository->findAll($filters);
    }

    public function create(array $data): array
    {
        return $this->salaryRepository->create($data);
    }

    public function update(int $id, array $data): array
    {
        return $this->salaryRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->salaryRepository->delete($id);
    }

    public function getForTeacher(int $teacherId): array
    {
        return $this->salaryRepository->findByTeacher($teacherId);
    }
}
