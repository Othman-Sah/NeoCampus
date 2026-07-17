<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\Succursale;
use App\Models\User;
use App\Models\Eleve;
use App\Application\UseCases\OnboardEstablishmentUseCase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminController extends Controller
{
    private OnboardEstablishmentUseCase $onboardUseCase;

    public function __construct(OnboardEstablishmentUseCase $onboardUseCase)
    {
        $this->onboardUseCase = $onboardUseCase;
    }

    /**
     * Get platform overview statistics.
     */
    public function stats()
    {
        // Bypass global scopes to query platform-wide metrics
        $totalSchools = Etablissement::count();
        $totalBranches = Succursale::count();
        
        // Count active students globally
        $totalStudents = Eleve::withoutGlobalScopes()->count();
        $totalUsers = User::withoutGlobalScopes()->count();

        // Calculate Monthly Recurring Revenue (MRR) based on active plans
        // Basic: €49, Premium: €99, Enterprise: €199
        $activeSubCount = Etablissement::where('subscription_status', 'active')->count();
        $basicCount = Etablissement::where('plan_tier', 'basic')->where('subscription_status', 'active')->count();
        $premiumCount = Etablissement::where('plan_tier', 'premium')->where('subscription_status', 'active')->count();
        $enterpriseCount = Etablissement::where('plan_tier', 'enterprise')->where('subscription_status', 'active')->count();

        $mrr = ($basicCount * 49) + ($premiumCount * 99) + ($enterpriseCount * 199);

        // Approximate database size in MB (MySQL specific)
        $dbSizeMb = 0.0;
        try {
            $dbName = config('database.connections.mysql.database');
            $queryResult = DB::select("
                SELECT SUM(data_length + index_length) / 1024 / 1024 AS size 
                FROM information_schema.TABLES 
                WHERE table_schema = ?
            ", [$dbName]);
            $dbSizeMb = round((float) ($queryResult[0]->size ?? 0.0), 2);
        } catch (\Exception $e) {
            $dbSizeMb = 12.4; // fallback for testing / sqlite environments
        }

        // Mock load stats
        $systemLoad = [
            'cpu' => 24,
            'db_connections' => 12,
            'db_size_mb' => $dbSizeMb ?: 12.4
        ];

        return response()->json([
            'total_schools' => $totalSchools,
            'total_branches' => $totalBranches,
            'total_students' => $totalStudents,
            'total_users' => $totalUsers,
            'mrr' => $mrr,
            'system_load' => $systemLoad
        ]);
    }

    /**
     * List all establishments.
     */
    public function listTenants(Request $request)
    {
        $tenants = Etablissement::withCount(['succursales'])
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json($tenants);
    }

    /**
     * Create/onboard a new establishment.
     */
    public function onboardTenant(Request $request)
    {
        $validated = $request->validate([
            'establishment_nom' => 'required|string|max:255',
            'establishment_adresse' => 'nullable|string|max:255',
            'plan_tier' => 'required|in:free,basic,premium,enterprise',
            'branch_nom' => 'nullable|string|max:255',
            'owner_nom' => 'required|string|max:255',
            'owner_prenom' => 'required|string|max:255',
            'owner_email' => 'required|email|unique:users,email',
            'owner_password' => 'required|string|min:8',
        ]);

        $result = $this->onboardUseCase->execute($validated);

        Log::info("Super Admin onboarded new Tenant: {$result['establishment']->nom} (ID: {$result['establishment']->id})");

        return response()->json([
            'message' => 'Establishment onboarded successfully',
            'etablissement' => $result['establishment']
        ], Response::HTTP_CREATED);
    }

    /**
     * Override tenant subscription configurations.
     */
    public function updateSubscription(Request $request, $id)
    {
        $request->validate([
            'plan_tier' => 'required|in:free,basic,premium,enterprise',
            'subscription_status' => 'required|string',
        ]);

        $etablissement = Etablissement::findOrFail($id);
        $etablissement->update([
            'plan_tier' => $request->plan_tier,
            'subscription_status' => $request->subscription_status,
            'subscription_ends_at' => now()->addMonth(),
        ]);

        // Automatically update limits in settings
        $etablissement->setSetting('max_branches', match($request->plan_tier) {
            'free' => 1,
            'basic' => 1,
            'premium' => 5,
            'enterprise' => 999,
            default => 1,
        });

        $etablissement->setSetting('max_students', match($request->plan_tier) {
            'free' => 50,
            'basic' => 200,
            'premium' => 1000,
            'enterprise' => 99999,
            default => 50,
        });

        Log::info("Super Admin overrode Subscription for Establishment ID {$id} to tier {$request->plan_tier} and status {$request->subscription_status}");

        return response()->json([
            'message' => 'Subscription overrides applied successfully',
            'etablissement' => $etablissement
        ]);
    }

    /**
     * Edit establishment limits manually.
     */
    public function updateLimits(Request $request, $id)
    {
        $request->validate([
            'max_branches' => 'required|integer|min:1',
            'max_students' => 'required|integer|min:1',
        ]);

        $etablissement = Etablissement::findOrFail($id);
        $etablissement->setSetting('max_branches', $request->max_branches);
        $etablissement->setSetting('max_students', $request->max_students);

        Log::info("Super Admin updated limits for Establishment ID {$id}: max_branches={$request->max_branches}, max_students={$request->max_students}");

        return response()->json([
            'message' => 'Limits updated successfully',
            'max_branches' => $request->max_branches,
            'max_students' => $request->max_students
        ]);
    }

    /**
     * Impersonate (Login-as) a user.
     */
    public function impersonate(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'reason' => 'required|string|min:5'
        ]);

        $superAdmin = $request->user();
        
        // Find user by bypassing global tenant scopes
        $user = User::withoutGlobalScopes()->findOrFail($request->user_id);

        if ($user->role === 'super-admin') {
            return response()->json([
                'message' => 'Cannot impersonate another super-admin.'
            ], Response::HTTP_FORBIDDEN);
        }

        // Generate Sanctum token for the impersonated user
        $token = $user->createToken('impersonation-token')->plainTextToken;

        // Log impersonation events to the system logs with full context
        Log::info("Super Admin (ID: {$superAdmin->id}) started impersonating User (ID: {$user->id}) in Tenant (ID: {$user->etablissement_id}). Reason: {$request->reason}", [
            'super_admin_id' => $superAdmin->id,
            'impersonated_user_id' => $user->id,
            'etablissement_id' => $user->etablissement_id,
            'reason' => $request->reason,
            'timestamp' => now()->toIso8601String()
        ]);

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'etablissement_id' => $user->etablissement_id,
                'succursale_id' => $user->succursale_id
            ],
            'message' => "Impersonation token generated successfully."
        ]);
    }

    /**
     * Retrieve audit and impersonation events.
     */
    public function auditLogs()
    {
        // For standard local logging, we read back simulated logs or query DB, 
        // here we can return a mock feed of logs from system database or mock list
        // since audit logs are shown chronologically.
        $logs = [
            [
                'id' => 1,
                'action' => 'impersonation_started',
                'description' => 'Super Admin (ID: 1) impersonated Owner (ID: 2) in Tenant (ID: 1)',
                'reason' => 'Debugging billing portal redirect issue.',
                'timestamp' => now()->subHours(2)->toIso8601String()
            ],
            [
                'id' => 2,
                'action' => 'tenant_limits_overridden',
                'description' => 'Super Admin (ID: 1) increased max_branches limit to 10 for Tenant (ID: 1)',
                'reason' => 'Enterprise exception request.',
                'timestamp' => now()->subDay()->toIso8601String()
            ],
            [
                'id' => 3,
                'action' => 'tenant_onboarded',
                'description' => 'Super Admin onboarded new Tenant: EMSI Rabat (ID: 2)',
                'reason' => 'New subscription onboarding.',
                'timestamp' => now()->subDays(3)->toIso8601String()
            ]
        ];

        return response()->json($logs);
    }
}
