<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\Succursale;
use App\Models\User;
use App\Models\Classe;
use App\Models\Section;
use App\Models\AnneeScolaire;
use App\Models\Scopes\TenantScope;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SaaSSecurityAndBillingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test 1: Cross-Tenant Access Prohibited
     */
    public function test_cross_tenant_access_is_prohibited(): void
    {
        // Create Tenant A
        $tenantA = Etablissement::create([
            'nom' => 'Tenant A',
            'code' => 'T_A',
            'subscription_status' => 'active',
        ]);
        $userA = User::create([
            'etablissement_id' => $tenantA->id,
            'nom' => 'User',
            'prenom' => 'A',
            'email' => 'usera@tenant.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create Tenant B
        $tenantB = Etablissement::create([
            'nom' => 'Tenant B',
            'code' => 'T_B',
            'subscription_status' => 'active',
        ]);
        
        $anneeScolaire = AnneeScolaire::withoutGlobalScopes()->create([
            'etablissement_id' => $tenantB->id,
            'libelle' => '2026-2027',
            'statut' => 'actif',
            'date_debut' => '2026-09-01',
            'date_fin' => '2027-06-30',
        ]);
        
        $section = Section::withoutGlobalScopes()->create([
            'etablissement_id' => $tenantB->id,
            'nom' => 'Primaire',
        ]);

        $classB = Classe::withoutGlobalScopes()->create([
            'etablissement_id' => $tenantB->id,
            'nom' => 'Class in Tenant B',
            'niveau' => 'Primaire',
            'section_id' => $section->id,
            'annee_scolaire_id' => $anneeScolaire->id,
        ]);

        // Log in as User A
        Sanctum::actingAs($userA);

        // Attempt to fetch Tenant B's class. Should return 404.
        $response = $this->getJson("/api/admin/classes/{$classB->id}");

        $response->assertStatus(404);
    }

    /**
     * Test 2: Subscription Access Gate (past_due / canceled returns 402)
     */
    public function test_subscription_access_gate_blocks_on_past_due_or_canceled(): void
    {
        $tenant = Etablissement::create([
            'nom' => 'School Test',
            'code' => 'SCH_T',
            'subscription_status' => 'past_due',
        ]);

        $user = User::create([
            'etablissement_id' => $tenant->id,
            'nom' => 'Owner',
            'prenom' => 'Test',
            'email' => 'owner@school.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        Sanctum::actingAs($user);

        // Requesting a protected class list route should yield 402 Payment Required
        $response = $this->getJson('/api/admin/classes');
        $response->assertStatus(402);
        $response->assertJsonFragment(['code' => 'PAYMENT_REQUIRED']);

        // Update status to canceled
        $tenant->update(['subscription_status' => 'canceled']);

        $response2 = $this->getJson('/api/admin/classes');
        $response2->assertStatus(402);
    }

    /**
     * Test 3: Super Admin Scope Bypass
     */
    public function test_super_admin_can_bypass_tenant_scopes(): void
    {
        // Create two tenants
        $tenantA = Etablissement::create(['nom' => 'Tenant A', 'code' => 'T_A']);
        $tenantB = Etablissement::create(['nom' => 'Tenant B', 'code' => 'T_B']);

        // Create Super Admin (associating with Tenant A to satisfy database foreign keys)
        $superAdmin = User::create([
            'etablissement_id' => $tenantA->id,
            'nom' => 'Super',
            'prenom' => 'Admin',
            'email' => 'super@admin.com',
            'password' => Hash::make('password123'),
            'role' => 'super-admin',
        ]);

        Sanctum::actingAs($superAdmin);

        // Fetch super-admin metrics which count elements globally
        $response = $this->getJson('/api/super-admin/stats');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'total_schools' => 2
        ]);
    }

    /**
     * Test 4: Onboarding Transactionality & Rollback
     */
    public function test_onboarding_pipeline_rolls_back_on_failure(): void
    {
        // Initially, Etablissements should be empty
        $this->assertEquals(0, Etablissement::count());

        // Call onboarding but trigger a database or validation failure by passing null email
        $useCase = app(\App\Application\UseCases\OnboardEstablishmentUseCase::class);

        try {
            $useCase->execute([
                'establishment_nom' => 'Onboarding Fail School',
                'establishment_adresse' => 'Fail Address',
                'plan_tier' => 'basic',
                'branch_nom' => 'Campus Fail',
                'owner_nom' => 'Fail Owner',
                'owner_prenom' => 'Fail Owner',
                'owner_email' => null, // Forces database constraint error
                'owner_password' => 'password123',
            ]);
        } catch (\Exception $e) {
            // Usecase failed as expected
        }

        // Verify that the Etablissement record was NOT created due to database rollback
        $this->assertEquals(0, Etablissement::count());
    }
}
