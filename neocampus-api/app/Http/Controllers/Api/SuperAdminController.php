<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\Succursale;
use App\Models\User;
use App\Models\Eleve;
use App\Models\AuditLog;
use App\Application\Services\AuditService;
use App\Application\UseCases\OnboardEstablishmentUseCase;
use App\Application\UseCases\GetPlatformSettingsUseCase;
use App\Application\UseCases\UpdatePlatformSettingUseCase;
use App\Application\DTOs\PlatformSettingDTO;
use App\Http\Requests\UpdatePlatformSettingRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminController extends Controller
{
    private OnboardEstablishmentUseCase $onboardUseCase;
    private AuditService $auditService;
    private GetPlatformSettingsUseCase $getSettingsUseCase;
    private UpdatePlatformSettingUseCase $updateSettingsUseCase;

    public function __construct(
        OnboardEstablishmentUseCase $onboardUseCase,
        AuditService $auditService,
        GetPlatformSettingsUseCase $getSettingsUseCase,
        UpdatePlatformSettingUseCase $updateSettingsUseCase
    ) {
        $this->onboardUseCase = $onboardUseCase;
        $this->auditService = $auditService;
        $this->getSettingsUseCase = $getSettingsUseCase;
        $this->updateSettingsUseCase = $updateSettingsUseCase;
    }

    private const PLAN_PRICES = [
        'free' => 0,
        'basic' => 49,
        'premium' => 99,
        'enterprise' => 199,
    ];

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
        $churnedCount = Etablissement::whereIn('subscription_status', ['canceled', 'suspended'])->count();
        $trialingCount = Etablissement::where('subscription_status', 'trialing')->count();
        $basicCount = Etablissement::where('plan_tier', 'basic')->where('subscription_status', 'active')->count();
        $premiumCount = Etablissement::where('plan_tier', 'premium')->where('subscription_status', 'active')->count();
        $enterpriseCount = Etablissement::where('plan_tier', 'enterprise')->where('subscription_status', 'active')->count();

        $mrr = ($basicCount * self::PLAN_PRICES['basic']) + ($premiumCount * self::PLAN_PRICES['premium']) + ($enterpriseCount * self::PLAN_PRICES['enterprise']);

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
            'active_tenants' => $activeSubCount,
            'churned_tenants' => $churnedCount,
            'trial_conversion_rate' => $activeSubCount + $trialingCount > 0
                ? round(($activeSubCount / ($activeSubCount + $trialingCount)) * 100, 1)
                : 0,
            'mrr' => $mrr,
            'at_risk_tenants' => Etablissement::whereIn('subscription_status', ['past_due', 'canceled'])
                ->orderBy('updated_at', 'desc')
                ->limit(5)
                ->get(['id', 'nom', 'code', 'plan_tier', 'subscription_status']),
            'system_load' => $systemLoad
        ]);
    }

    public function revenueHistory()
    {
        $priceByTier = [
            'basic' => 49,
            'premium' => 99,
            'enterprise' => 199,
        ];

        $months = collect(range(5, 0))->map(fn ($offset) => now()->startOfMonth()->subMonths($offset));

        $data = $months->map(function ($month) use ($priceByTier) {
            $tenants = Etablissement::where('subscription_status', 'active')
                ->whereDate('created_at', '<=', $month->copy()->endOfMonth())
                ->get(['plan_tier']);

            return [
                'name' => $month->format('M'),
                'Basic' => $tenants->where('plan_tier', 'basic')->count() * $priceByTier['basic'],
                'Premium' => $tenants->where('plan_tier', 'premium')->count() * $priceByTier['premium'],
                'Enterprise' => $tenants->where('plan_tier', 'enterprise')->count() * $priceByTier['enterprise'],
            ];
        });

        return response()->json($data);
    }

    public function growthHistory()
    {
        $months = collect(range(5, 0))->map(fn ($offset) => now()->startOfMonth()->subMonths($offset));

        $data = $months->map(fn ($month) => [
            'name' => $month->format('M'),
            'schools' => Etablissement::whereDate('created_at', '<=', $month->copy()->endOfMonth())->count(),
        ]);

        return response()->json($data);
    }

    /**
     * List all establishments.
     */
    public function listTenants(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'plan_tier' => ['nullable', Rule::in(['free', 'basic', 'premium', 'enterprise'])],
            'subscription_status' => 'nullable|string|max:50',
            'sort_by' => ['nullable', Rule::in(['nom', 'created_at', 'succursales_count', 'users_count', 'eleves_count'])],
            'sort_direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => 'nullable|integer|min:5|max:50',
        ]);

        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';

        $tenants = Etablissement::withCount(['succursales', 'users', 'eleves'])
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($nested) use ($search) {
                    $nested->where('nom', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($validated['plan_tier'] ?? null, fn ($query, $tier) => $query->where('plan_tier', $tier))
            ->when($validated['subscription_status'] ?? null, fn ($query, $status) => $query->where('subscription_status', $status))
            ->orderBy($sortBy, $sortDirection)
            ->paginate($validated['per_page'] ?? 10)
            ->withQueryString();

        return response()->json($tenants);
    }

    public function tenantDetail($id)
    {
        $tenant = Etablissement::withCount(['succursales', 'users', 'eleves'])
            ->with([
                'settings:id,etablissement_id,key,value',
                'succursales' => fn ($query) => $query
                    ->withCount(['users', 'eleves'])
                    ->orderBy('created_at', 'desc'),
                'users' => fn ($query) => $query
                    ->select('id', 'etablissement_id', 'succursale_id', 'nom', 'prenom', 'email', 'role', 'created_at')
                    ->orderBy('created_at', 'desc')
                    ->limit(100),
            ])
            ->findOrFail($id);

        return response()->json($tenant);
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
        $this->auditService->record($request, 'tenant_onboarded', 'tenant', $result['establishment']->id, [
            'tenant_name' => $result['establishment']->nom,
            'plan_tier' => $validated['plan_tier'],
            'owner_email' => $validated['owner_email'],
        ]);

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
        $this->auditService->record($request, 'tenant_subscription_overridden', 'tenant', (int) $id, [
            'tenant_name' => $etablissement->nom,
            'plan_tier' => $request->plan_tier,
            'subscription_status' => $request->subscription_status,
        ]);

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
        $this->auditService->record($request, 'tenant_limits_overridden', 'tenant', (int) $id, [
            'tenant_name' => $etablissement->nom,
            'max_branches' => $request->max_branches,
            'max_students' => $request->max_students,
        ]);

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
        $this->auditService->record($request, 'impersonation_started', 'user', $user->id, [
            'impersonated_user_id' => $user->id,
            'impersonated_user_name' => trim($user->prenom . ' ' . $user->nom),
            'impersonated_user_role' => $user->role,
            'etablissement_id' => $user->etablissement_id,
            'reason' => $request->reason,
        ]);

        $user->load('etablissement');

        return response()->json([
            'token' => $token,
            'original_token' => $request->bearerToken(),
            'original_user' => [
                'id' => $superAdmin->id,
                'nom' => $superAdmin->nom,
                'prenom' => $superAdmin->prenom,
                'email' => $superAdmin->email,
                'role' => $superAdmin->role,
                'etablissement_id' => $superAdmin->etablissement_id,
                'succursale_id' => $superAdmin->succursale_id,
            ],
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'etablissement_id' => $user->etablissement_id,
                'succursale_id' => $user->succursale_id,
                'etablissement' => $user->etablissement ? [
                    'id' => $user->etablissement->id,
                    'nom' => $user->etablissement->nom,
                    'plan_tier' => $user->etablissement->plan_tier,
                    'subscription_status' => $user->etablissement->subscription_status,
                    'trial_ends_at' => $user->etablissement->trial_ends_at,
                    'subscription_ends_at' => $user->etablissement->subscription_ends_at,
                ] : null,
            ],
            'message' => "Impersonation token generated successfully."
        ]);
    }

    public function stopImpersonation(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Impersonation token revoked.'
        ]);
    }

    /**
     * Retrieve audit and impersonation events.
     */
    public function auditLogs(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'action' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:100',
            'target_id' => 'nullable|integer',
            'actor_id' => 'nullable|integer',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $logs = AuditLog::with('actor:id,nom,prenom,email,role')
            ->when($validated['action'] ?? null, fn ($query, $action) => $query->where('action', $action))
            ->when($validated['target_type'] ?? null, fn ($query, $type) => $query->where('target_type', $type))
            ->when($validated['target_id'] ?? null, fn ($query, $id) => $query->where('target_id', $id))
            ->when($validated['actor_id'] ?? null, fn ($query, $id) => $query->where('actor_id', $id))
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($nested) use ($search) {
                    $nested->where('action', 'like', "%{$search}%")
                        ->orWhere('target_type', 'like', "%{$search}%")
                        ->orWhere('metadata', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return response()->json($logs);
    }

    public function impersonationHistory(Request $request)
    {
        $request->merge(['action' => 'impersonation_started']);
        return $this->auditLogs($request);
    }

    public function listUsers(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'etablissement_id' => 'nullable|integer|exists:etablissements,id',
            'role' => 'nullable|string|max:50',
            'status' => ['nullable', Rule::in(['active', 'disabled'])],
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $users = User::withoutGlobalScopes()
            ->with('etablissement:id,nom,code,plan_tier,subscription_status')
            ->when($validated['search'] ?? null, function ($query, $search) {
                $query->where(function ($nested) use ($search) {
                    $nested->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($validated['etablissement_id'] ?? null, fn ($query, $tenantId) => $query->where('etablissement_id', $tenantId))
            ->when($validated['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when($validated['status'] ?? null, fn ($query, $status) => $status === 'disabled' ? $query->whereNotNull('disabled_at') : $query->whereNull('disabled_at'))
            ->orderBy('created_at', 'desc')
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return response()->json($users);
    }

    public function disableUser(Request $request, $id)
    {
        $user = User::withoutGlobalScopes()->findOrFail($id);

        if ($user->role === 'super-admin') {
            return response()->json(['message' => 'Cannot disable a super-admin account.'], Response::HTTP_FORBIDDEN);
        }

        $user->forceFill(['disabled_at' => now()])->save();
        $user->tokens()->delete();

        $this->auditService->record($request, 'user_disabled', 'user', $user->id, [
            'user_email' => $user->email,
            'user_role' => $user->role,
            'etablissement_id' => $user->etablissement_id,
        ]);

        return response()->json(['message' => 'User disabled successfully.']);
    }

    public function enableUser(Request $request, $id)
    {
        $user = User::withoutGlobalScopes()->findOrFail($id);

        $user->forceFill(['disabled_at' => null])->save();

        $this->auditService->record($request, 'user_enabled', 'user', $user->id, [
            'user_email' => $user->email,
            'user_role' => $user->role,
            'etablissement_id' => $user->etablissement_id,
        ]);

        return response()->json(['message' => 'User enabled successfully.']);
    }

    public function resetUserPassword(Request $request, $id)
    {
        $user = User::withoutGlobalScopes()->findOrFail($id);
        $temporaryPassword = Str::password(12);
        $user->forceFill([
            'password' => Hash::make($temporaryPassword),
            'temp_password' => $temporaryPassword,
        ])->save();
        $user->tokens()->delete();

        $this->auditService->record($request, 'user_password_reset', 'user', $user->id, [
            'user_email' => $user->email,
            'user_role' => $user->role,
            'etablissement_id' => $user->etablissement_id,
        ]);

        return response()->json([
            'message' => 'Temporary password generated.',
            'temporary_password' => $temporaryPassword,
        ]);
    }

    public function billingRevenue()
    {
        $tenants = Etablissement::withCount(['succursales', 'users', 'eleves'])->get();
        $activeTenants = $tenants->where('subscription_status', 'active');
        $mrr = $activeTenants->sum(fn ($tenant) => self::PLAN_PRICES[$tenant->plan_tier] ?? 0);
        $churned = $tenants->whereIn('subscription_status', ['canceled', 'suspended'])->count();

        return response()->json([
            'mrr' => $mrr,
            'arr' => $mrr * 12,
            'arpt' => $activeTenants->count() > 0 ? round($mrr / $activeTenants->count(), 2) : 0,
            'churn_rate' => $tenants->count() > 0 ? round(($churned / $tenants->count()) * 100, 1) : 0,
            'tier_distribution' => collect(array_keys(self::PLAN_PRICES))->map(fn ($tier) => [
                'tier' => $tier,
                'count' => $tenants->where('plan_tier', $tier)->count(),
            ])->values(),
            'tenants' => $tenants->map(fn ($tenant) => [
                'id' => $tenant->id,
                'nom' => $tenant->nom,
                'code' => $tenant->code,
                'plan_tier' => $tenant->plan_tier,
                'subscription_status' => $tenant->subscription_status,
                'monthly_price' => self::PLAN_PRICES[$tenant->plan_tier] ?? 0,
                'users_count' => $tenant->users_count,
                'eleves_count' => $tenant->eleves_count,
                'created_at' => $tenant->created_at,
            ])->values(),
        ]);
    }

    public function billingEvents(Request $request)
    {
        $request->merge(['action' => 'tenant_subscription_overridden']);
        return $this->auditLogs($request);
    }

    public function getPlatformSettings()
    {
        return response()->json($this->getSettingsUseCase->execute());
    }

    public function updatePlatformSettings(UpdatePlatformSettingRequest $request)
    {
        $dto = PlatformSettingDTO::fromRequest($request->input('key'), $request->input('value'));
        $this->updateSettingsUseCase->execute($request, $dto);

        return response()->json([
            'message' => 'Platform settings updated successfully.'
        ]);
    }

    public function health()
    {
        // CPU Usage
        $cpu = 10.0;
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = [];
            @exec('wmic cpu get loadpercentage', $output);
            foreach ($output as $line) {
                if (is_numeric(trim($line))) {
                    $cpu = (float) trim($line);
                    break;
                }
            }
        } else {
            $load = sys_getloadavg();
            $cpu = round($load[0] * 10, 1);
        }

        // Memory Usage
        $memory = ['total' => 16.0, 'used' => 8.0, 'percentage' => 50.0];
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = [];
            @exec('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value', $output);
            $free = 0;
            $total = 0;
            foreach ($output as $line) {
                if (strpos($line, 'FreePhysicalMemory') !== false) {
                    $free = (int) filter_var($line, FILTER_SANITIZE_NUMBER_INT);
                }
                if (strpos($line, 'TotalVisibleMemorySize') !== false) {
                    $total = (int) filter_var($line, FILTER_SANITIZE_NUMBER_INT);
                }
            }
            if ($total > 0) {
                $freeGb = $free / 1024 / 1024;
                $totalGb = $total / 1024 / 1024;
                $usedGb = $totalGb - $freeGb;
                $memory = [
                    'total' => round($totalGb, 2),
                    'used' => round($usedGb, 2),
                    'percentage' => round(($usedGb / $totalGb) * 100, 1)
                ];
            }
        } else {
            $free = shell_exec('free -t -m');
            $lines = explode("\n", $free);
            if (isset($lines[1])) {
                $parts = preg_split('/\s+/', $lines[1]);
                if (count($parts) >= 4) {
                    $totalMb = (float) $parts[1];
                    $usedMb = (float) $parts[2];
                    $memory = [
                        'total' => round($totalMb / 1024, 2),
                        'used' => round($usedMb / 1024, 2),
                        'percentage' => round(($usedMb / $totalMb) * 100, 1)
                    ];
                }
            }
        }

        // Disk Usage
        $diskPath = base_path();
        $totalDisk = @disk_total_space($diskPath) ?: 100 * 1024 * 1024 * 1024;
        $freeDisk = @disk_free_space($diskPath) ?: 50 * 1024 * 1024 * 1024;
        $usedDisk = $totalDisk - $freeDisk;
        $disk = [
            'total' => round($totalDisk / 1024 / 1024 / 1024, 2),
            'used' => round($usedDisk / 1024 / 1024 / 1024, 2),
            'free' => round($freeDisk / 1024 / 1024 / 1024, 2),
            'percentage' => round(($usedDisk / $totalDisk) * 100, 1)
        ];

        // Database telemetry
        $dbName = config('database.connections.mysql.database');
        $dbSizeMb = 0.0;
        try {
            $queryResult = DB::select("
                SELECT SUM(data_length + index_length) / 1024 / 1024 AS size 
                FROM information_schema.TABLES 
                WHERE table_schema = ?
            ", [$dbName]);
            $dbSizeMb = round((float) ($queryResult[0]->size ?? 0.0), 2);
        } catch (\Exception $e) {
            $dbSizeMb = 12.4;
        }

        $connections = 0;
        try {
            $threadsResult = DB::select("SHOW STATUS LIKE 'Threads_connected'");
            $connections = (int) ($threadsResult[0]->Value ?? 0);
        } catch (\Exception $e) {
            $connections = 1;
        }

        $tables = [];
        try {
            $tablesData = DB::select("
                SELECT TABLE_NAME as name, TABLE_ROWS as rows_approx 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_ROWS DESC
            ", [$dbName]);
            $tables = array_map(fn($t) => [
                'name' => $t->name,
                'rows_approx' => (int) $t->rows_approx,
            ], $tablesData);
        } catch (\Exception $e) {
            $tables = [];
        }

        // Active sessions telemetry
        $activeSessions = 0;
        $guestSessions = 0;
        try {
            $activeSessions = DB::table('sessions')->whereNotNull('user_id')->distinct('user_id')->count();
            $guestSessions = DB::table('sessions')->whereNull('user_id')->count();
        } catch (\Exception $e) {
            $activeSessions = 1;
            $guestSessions = 0;
        }

        // Queue Health
        $pendingJobs = 0;
        $failedJobs = 0;
        try {
            $pendingJobs = DB::table('jobs')->count();
        } catch (\Exception $e) {}
        try {
            $failedJobs = DB::table('failed_jobs')->count();
        } catch (\Exception $e) {}

        // Uptime
        $uptimeString = 'Unknown';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $output = [];
            @exec('wmic os get lastbootuptime', $output);
            foreach ($output as $line) {
                if (strpos($line, 'LastBootUpTime') === false && trim($line) !== '') {
                    $datePart = substr(trim($line), 0, 14);
                    try {
                        $bootTime = \Carbon\Carbon::createFromFormat('YmdHis', $datePart);
                        $diff = $bootTime->diff(now());
                        $uptimeString = "{$diff->d} days, {$diff->h} hours, {$diff->i} minutes";
                    } catch (\Exception $e) {
                        $uptimeString = 'Unknown';
                    }
                    break;
                }
            }
        } else {
            $output = [];
            @exec('uptime -p', $output);
            $uptimeString = isset($output[0]) ? trim($output[0]) : 'Unknown';
        }

        return response()->json([
            'system_load' => [
                'cpu' => $cpu,
                'memory' => $memory,
                'disk' => $disk,
                'uptime' => $uptimeString,
            ],
            'database' => [
                'name' => $dbName,
                'size_mb' => $dbSizeMb,
                'connections' => $connections,
                'tables' => $tables,
            ],
            'queue' => [
                'pending' => $pendingJobs,
                'failed' => $failedJobs,
            ],
            'sessions' => [
                'active_users' => $activeSessions,
                'guests' => $guestSessions,
                'total' => $activeSessions + $guestSessions,
            ]
        ]);
    }
}
