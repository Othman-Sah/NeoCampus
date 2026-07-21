<?php

namespace App\Application\UseCases;

use App\Domain\Ports\PlatformSettingRepositoryInterface;

class GetPlatformSettingsUseCase
{
    private PlatformSettingRepositoryInterface $repository;

    public function __construct(PlatformSettingRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    private const DEFAULTS = [
        'plans' => [
            'free' => ['price' => 0, 'max_branches' => 1, 'max_students' => 50, 'features' => ['dashboard', 'users']],
            'basic' => ['price' => 49, 'max_branches' => 1, 'max_students' => 200, 'features' => ['dashboard', 'users', 'finance']],
            'premium' => ['price' => 99, 'max_branches' => 5, 'max_students' => 1000, 'features' => ['dashboard', 'users', 'finance', 'library', 'exams']],
            'enterprise' => ['price' => 199, 'max_branches' => 999, 'max_students' => 99999, 'features' => ['dashboard', 'users', 'finance', 'library', 'exams', 'transport', 'ai_chatbot']],
        ],
        'defaults' => [
            'library_loan_duration_days' => 14,
            'library_max_loans_per_member' => 5,
            'library_fine_per_day_mad' => 2,
            'bulletin_format_periode' => 'trimestre',
            'bulletin_seuil_encouragements' => 12.0,
            'bulletin_seuil_tableau_honneur' => 14.0,
            'bulletin_seuil_felicitations' => 16.0,
            'bulletin_show_min_max' => true,
            'bulletin_show_rang_matiere' => true,
            'bulletin_show_detail_notes' => false,
            'bulletin_show_sous_total_groupe' => true,
            'fee_registration_montant' => 1000.00,
            'fee_monthly_montant' => 500.00,
        ],
        'feature_flags' => [
            'library_enabled' => true,
            'transport_enabled' => true,
            'bulletins_enabled' => true,
            'finance_enabled' => true,
            'chatbot_enabled' => true,
        ],
        'maintenance' => [
            'active' => false,
            'message' => 'NeoCampus is undergoing scheduled maintenance. We will return shortly!',
        ],
    ];

    public function execute(): array
    {
        $all = $this->repository->all();
        $result = [];

        foreach (self::DEFAULTS as $key => $defaultValues) {
            $result[$key] = array_key_exists($key, $all) ? $all[$key] : $defaultValues;
        }

        return $result;
    }
}
