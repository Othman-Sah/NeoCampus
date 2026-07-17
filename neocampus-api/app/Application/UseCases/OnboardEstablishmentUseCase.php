<?php

namespace App\Application\UseCases;

use App\Models\Etablissement;
use App\Models\Succursale;
use App\Models\User;
use App\Application\Services\EstablishmentBootstrapper;
use App\Events\TenantOnboarded;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class OnboardEstablishmentUseCase
{
    private EstablishmentBootstrapper $bootstrapper;

    public function __construct(EstablishmentBootstrapper $bootstrapper)
    {
        $this->bootstrapper = $bootstrapper;
    }

    /**
     * Onboard a brand new establishment atomically.
     *
     * @param array $data
     * @return array
     */
    public function execute(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create Establishment: Save the Etablissement record with a default 14-day trial tier.
            $etablissement = Etablissement::create([
                'nom' => $data['establishment_nom'],
                'adresse' => $data['establishment_adresse'] ?? null,
                'code' => strtoupper(substr(uniqid('NC_'), -8)),
                'plan_tier' => $data['plan_tier'] ?? 'basic',
                'subscription_status' => 'trialing',
                'trial_ends_at' => now()->addDays(14),
                'subscription_ends_at' => now()->addDays(14),
            ]);

            // 2. Create Default Branch: Create the first physical branch record (Succursale) for the school.
            $succursale = Succursale::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $data['branch_nom'] ?? 'Succursale Principale',
                'adresse' => $data['branch_adresse'] ?? $etablissement->adresse,
                'telephone' => $data['branch_telephone'] ?? null,
            ]);

            // 3. Register Owner Account: Create a User record with the role admin, attached to the establishment and default branch.
            $user = User::create([
                'etablissement_id' => $etablissement->id,
                'succursale_id' => $succursale->id,
                'nom' => $data['owner_nom'],
                'prenom' => $data['owner_prenom'],
                'email' => $data['owner_email'],
                'password' => Hash::make($data['owner_password']),
                'role' => 'admin',
            ]);

            // 4. Bootstrap Settings: Invoke EstablishmentBootstrapper to write default configurations
            $this->bootstrapper->bootstrapAll($etablissement->id);

            // Set default limits in etablissement_settings
            $etablissement->setSetting('max_branches', match($etablissement->plan_tier) {
                'free' => 1,
                'basic' => 1,
                'premium' => 5,
                'enterprise' => 999,
                default => 1,
            });
            
            $etablissement->setSetting('max_students', match($etablissement->plan_tier) {
                'free' => 50,
                'basic' => 200,
                'premium' => 1000,
                'enterprise' => 99999,
                default => 50,
            });

            // 5. Dispatch Events: Dispatch a TenantOnboarded event
            event(new TenantOnboarded($etablissement));

            return [
                'establishment' => $etablissement,
                'branch' => $succursale,
                'owner' => $user
            ];
        });
    }
}
