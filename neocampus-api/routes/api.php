<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])->middleware('throttle:60,1');

// Authenticated Routes (Tenant Isolated, Subscription Gated & Rate limited)
Route::middleware(['auth:sanctum', 'tenant', 'subscription', 'throttle:600,1'])->group(function () {
    
    // Auth actions
    Route::post('/auth/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/auth/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    // Timetable Routes
    Route::get('/classes/{id}/seances', [\App\Http\Controllers\Api\SeanceController::class, 'classSeances']);
    Route::get('/enseignants/{id}/seances', [\App\Http\Controllers\Api\SeanceController::class, 'teacherSeances']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/seances', [\App\Http\Controllers\Api\SeanceController::class, 'store']);
        Route::put('/seances/{id}', [\App\Http\Controllers\Api\SeanceController::class, 'update']);
        Route::delete('/seances/{id}', [\App\Http\Controllers\Api\SeanceController::class, 'destroy']);
    });

    // Admin and Comptable Read Routes
    Route::middleware('role:admin,comptable')->prefix('admin')->group(function () {
        Route::get('eleves', [\App\Http\Controllers\Api\StudentController::class, 'index']);
        Route::get('eleves/{id}', [\App\Http\Controllers\Api\StudentController::class, 'show']);
        Route::get('classes', [\App\Http\Controllers\Api\ClassController::class, 'index']);
        Route::get('classes/{id}', [\App\Http\Controllers\Api\ClassController::class, 'show']);
        Route::get('academic-years', [\App\Http\Controllers\Api\ClassController::class, 'academicYears']);
        Route::get('sections', [\App\Http\Controllers\Api\SectionController::class, 'index']);
        Route::get('enseignants', [\App\Http\Controllers\Api\TeacherController::class, 'index']);
        Route::get('enseignants/{id}', [\App\Http\Controllers\Api\TeacherController::class, 'show']);
    });

    // Admin-only Write Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('branches', [\App\Http\Controllers\Api\BranchController::class, 'index']);
        Route::post('/eleves/{id}/avatar', [\App\Http\Controllers\Api\StudentController::class, 'uploadAvatar']);
        Route::post('/eleves/{id}/reveal-password', [\App\Http\Controllers\Api\StudentController::class, 'revealPassword']);
        Route::put('/eleves/{id}/password', [\App\Http\Controllers\Api\StudentController::class, 'updatePassword']);
        Route::post('eleves', [\App\Http\Controllers\Api\StudentController::class, 'store']);
        Route::put('eleves/{eleve}', [\App\Http\Controllers\Api\StudentController::class, 'update']);
        Route::delete('eleves/{eleve}', [\App\Http\Controllers\Api\StudentController::class, 'destroy']);

        Route::post('classes', [\App\Http\Controllers\Api\ClassController::class, 'store']);
        Route::put('classes/{class}', [\App\Http\Controllers\Api\ClassController::class, 'update']);
        Route::delete('classes/{class}', [\App\Http\Controllers\Api\ClassController::class, 'destroy']);

        Route::post('sections', [\App\Http\Controllers\Api\SectionController::class, 'store']);
        Route::put('sections/{section}', [\App\Http\Controllers\Api\SectionController::class, 'update']);
        Route::delete('sections/{section}', [\App\Http\Controllers\Api\SectionController::class, 'destroy']);

        Route::get('subjects', [\App\Http\Controllers\Api\TeacherController::class, 'subjects']);
        Route::post('enseignants/assign', [\App\Http\Controllers\Api\TeacherController::class, 'assign']);
        Route::post('enseignants/unassign', [\App\Http\Controllers\Api\TeacherController::class, 'unassign']);
        Route::post('/enseignants/{id}/avatar', [\App\Http\Controllers\Api\TeacherController::class, 'uploadAvatar']);
        Route::post('enseignants', [\App\Http\Controllers\Api\TeacherController::class, 'store']);
        Route::put('enseignants/{enseignant}', [\App\Http\Controllers\Api\TeacherController::class, 'update']);
        Route::delete('enseignants/{enseignant}', [\App\Http\Controllers\Api\TeacherController::class, 'destroy']);
        Route::post('/enseignants/{id}/reveal-password', [\App\Http\Controllers\Api\TeacherController::class, 'revealPassword']);
        Route::apiResource('accountants', \App\Http\Controllers\Api\AccountantController::class);
        Route::apiResource('parents', \App\Http\Controllers\Api\Admin\ParentController::class);

        // Class Subjects Management
        Route::get('classes/{id}/matieres', [\App\Http\Controllers\Api\ClassController::class, 'getMatieres']);
        Route::post('classes/{id}/matieres', [\App\Http\Controllers\Api\ClassController::class, 'addMatiere']);
        Route::delete('classes/{id}/matieres/{matiereId}', [\App\Http\Controllers\Api\ClassController::class, 'removeMatiere']);
        Route::put('classes/{id}/matieres/{matiereId}/enseignant', [\App\Http\Controllers\Api\ClassController::class, 'updateTeacher']);
        Route::put('classes/{id}/matieres/{matiereId}/coefficient', [\App\Http\Controllers\Api\ClassController::class, 'updateCoefficient']);
        Route::get('classes/{id}/matieres-with-enseignants', [\App\Http\Controllers\Api\ClassController::class, 'getMatieresWithEnseignants']);
    });

    // Comptable (Finance) Routes
    Route::middleware(['role:comptable,admin', 'throttle:600,1'])->prefix('finance')->group(function () {
        Route::apiResource('salaires', \App\Http\Controllers\Api\SalaryController::class);
        
        // Fee Configuration
        Route::get('/groups', [\App\Http\Controllers\Api\FinanceConfigController::class, 'listGroups']);
        Route::post('/groups', [\App\Http\Controllers\Api\FinanceConfigController::class, 'storeGroup']);
        Route::put('/groups/{group}', [\App\Http\Controllers\Api\FinanceConfigController::class, 'updateGroup']);
        Route::delete('/groups/{group}', [\App\Http\Controllers\Api\FinanceConfigController::class, 'destroyGroup']);
        
        Route::get('/types', [\App\Http\Controllers\Api\FinanceConfigController::class, 'listTypes']);
        Route::post('/types', [\App\Http\Controllers\Api\FinanceConfigController::class, 'storeType']);
        Route::put('/types/{type}', [\App\Http\Controllers\Api\FinanceConfigController::class, 'updateType']);
        Route::delete('/types/{type}', [\App\Http\Controllers\Api\FinanceConfigController::class, 'destroyType']);
        
        // Fee Assignment & Modifiers
        Route::post('/fees/assign', [\App\Http\Controllers\Api\FinanceFeeController::class, 'assign']);
        Route::get('/fees', [\App\Http\Controllers\Api\FinanceFeeController::class, 'index']);
        Route::get('/fees/{id}', [\App\Http\Controllers\Api\FinanceFeeController::class, 'show']);
        Route::post('/fees/{id}/remise', [\App\Http\Controllers\Api\FinanceFeeController::class, 'remise']);
        Route::post('/fees/{id}/penalite', [\App\Http\Controllers\Api\FinanceFeeController::class, 'penalite']);
        
        // Payments & Student Balance
        Route::post('/payments', [\App\Http\Controllers\Api\FinancePaymentController::class, 'store']);
        Route::get('/payments', [\App\Http\Controllers\Api\FinancePaymentController::class, 'index']);
        Route::get('/students/{id}/balance', [\App\Http\Controllers\Api\FinancePaymentController::class, 'studentBalance']);
        
        // Reports
        Route::get('/reports/summary', [\App\Http\Controllers\Api\FinanceReportController::class, 'summary']);
        Route::get('/reports/transactions', [\App\Http\Controllers\Api\FinanceReportController::class, 'transactions']);
        
        // Accounting
        Route::get('/accounting', [\App\Http\Controllers\Api\FinanceAccountingController::class, 'index']);
        Route::post('/accounting', [\App\Http\Controllers\Api\FinanceAccountingController::class, 'store']);
        Route::put('/accounting/{id}', [\App\Http\Controllers\Api\FinanceAccountingController::class, 'update']);
        Route::delete('/accounting/{id}', [\App\Http\Controllers\Api\FinanceAccountingController::class, 'destroy']);
    });

    // Enseignant (Teacher) Routes
    Route::middleware('role:enseignant,admin')->prefix('teacher')->group(function () {
        Route::get('/me', [\App\Http\Controllers\Api\TeacherController::class, 'me']);
        Route::get('/salaires', [\App\Http\Controllers\Api\SalaryController::class, 'mySalaries']);
    });

    // --- Attendance Module (enseignant|admin) ---
    Route::middleware('role:enseignant,admin')->group(function () {
        Route::post('/presences/bulk', [\App\Http\Controllers\Api\PresenceController::class, 'submitBulk']);
        Route::get('/classes/{id}/presences', [\App\Http\Controllers\Api\PresenceController::class, 'classPresences']);
        Route::get('/classes/{id}/eleves', [\App\Http\Controllers\Api\ClassController::class, 'students']);
        Route::get('/eleves/{id}/presences', [\App\Http\Controllers\Api\PresenceController::class, 'studentPresences']);
        Route::get('/presences', [\App\Http\Controllers\Api\PresenceController::class, 'index']);
        Route::put('/presences/{id}', [\App\Http\Controllers\Api\PresenceController::class, 'update']);
    });

    // --- Grades & Strict Windows Module ---
    Route::middleware('role:enseignant,admin')->group(function () {
        Route::post('/notes/bulk', [\App\Http\Controllers\Api\GradeController::class, 'submitBulk']);
        Route::post('/notes/exceptions/request', [\App\Http\Controllers\Api\GradeController::class, 'requestException']);
        Route::get('/notes/check-window/{examenId}', [\App\Http\Controllers\Api\GradeController::class, 'checkWindow']);
        Route::get('/notes/examen/{examenId}', [\App\Http\Controllers\Api\GradeController::class, 'findByExamen']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/admin/notes/exceptions/{id}/approve', [\App\Http\Controllers\Api\GradeController::class, 'approveException']);
        Route::get('/admin/notes/exceptions/pending', [\App\Http\Controllers\Api\GradeController::class, 'pendingExceptions']);
    });

    // --- Exam Scheduling & Upload Module ---
    Route::middleware('role:enseignant,admin')->group(function () {
        Route::post('/examens/propose-schedule', [\App\Http\Controllers\Api\ExamenController::class, 'proposeSchedule']);
        Route::post('/examens/{id}/upload-sujet', [\App\Http\Controllers\Api\ExamenController::class, 'uploadSujet']);
        Route::get('/examens/teacher', [\App\Http\Controllers\Api\ExamenController::class, 'teacherExams']);
        Route::get('/parametres-examens/template', [\App\Http\Controllers\Api\ExamenController::class, 'downloadTemplate']);
        Route::get('/parametres-examens', [\App\Http\Controllers\Api\ExamenController::class, 'getSettings']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/admin/examens/schedule/{id}/review', [\App\Http\Controllers\Api\ExamenController::class, 'reviewSchedule']);
        Route::get('/admin/examens/proposals/pending', [\App\Http\Controllers\Api\ExamenController::class, 'pendingProposals']);
        Route::post('/admin/parametres-examens', [\App\Http\Controllers\Api\ExamenController::class, 'updateSettings']);
    });

    // --- Bulletins Module ---
    Route::middleware('role:admin')->prefix('bulletins')->group(function () {
        Route::post('/generate/bulk', [\App\Http\Controllers\Api\BulletinController::class, 'generateBulk']);
        Route::post('/generate/single', [\App\Http\Controllers\Api\BulletinController::class, 'generateSingle']);
        Route::put('/{id}/publish', [\App\Http\Controllers\Api\BulletinController::class, 'publish']);
        Route::put('/{id}/decision', [\App\Http\Controllers\Api\BulletinController::class, 'updateDecision']);
        Route::put('/{id}/validate', [\App\Http\Controllers\Api\BulletinController::class, 'validateBulletin']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/bulletin-config', [\App\Http\Controllers\Api\BulletinConfigController::class, 'show']);
        Route::put('/bulletin-config', [\App\Http\Controllers\Api\BulletinConfigController::class, 'update']);

        Route::get('/coefficient-classe-matiere', [\App\Http\Controllers\Api\CoefficientClasseMatiereController::class, 'index']);
        Route::post('/coefficient-classe-matiere', [\App\Http\Controllers\Api\CoefficientClasseMatiereController::class, 'store']);
        Route::delete('/coefficient-classe-matiere', [\App\Http\Controllers\Api\CoefficientClasseMatiereController::class, 'destroy']);

        Route::apiResource('type-evaluations', \App\Http\Controllers\Api\TypeEvaluationController::class);
        Route::apiResource('groupe-matieres', \App\Http\Controllers\Api\GroupeMatiereController::class);
    });

    Route::middleware('role:admin,comptable')->group(function () {
        Route::get('/classes/{id}/bulletins', [\App\Http\Controllers\Api\BulletinController::class, 'classBulletins']);
    });

    Route::middleware('role:enseignant,admin')->group(function () {
        Route::put('/bulletins/{id}/appreciations', [\App\Http\Controllers\Api\BulletinController::class, 'updateAppreciations']);
    });

    Route::middleware('role:admin,enseignant,parent,eleve')->group(function () {
        Route::get('/my-bulletins', [\App\Http\Controllers\Api\BulletinController::class, 'getMyBulletins']);
        Route::get('/bulletins/{id}', [\App\Http\Controllers\Api\BulletinController::class, 'show']);
    });

    // --- Library Module ---
    Route::middleware('role:bibliothecaire,admin')->prefix('v1/library')->group(function () {
        Route::get('/books', [\App\Http\Controllers\Api\Library\LibraryController::class, 'index']);
        Route::post('/books', [\App\Http\Controllers\Api\Library\LibraryController::class, 'store']);
        Route::put('/books/{id}', [\App\Http\Controllers\Api\Library\LibraryController::class, 'update']);
        Route::delete('/books/{id}', [\App\Http\Controllers\Api\Library\LibraryController::class, 'destroy']);
        Route::get('/loans', [\App\Http\Controllers\Api\Library\LibraryController::class, 'loans']);
        Route::post('/loans', [\App\Http\Controllers\Api\Library\LibraryController::class, 'storeLoan']);
        Route::put('/loans/{id}/return', [\App\Http\Controllers\Api\Library\LibraryController::class, 'returnBook']);
        Route::get('/overdue', [\App\Http\Controllers\Api\Library\LibraryController::class, 'overdue']);
        Route::get('/stats', [\App\Http\Controllers\Api\Library\LibraryController::class, 'stats']);
        Route::get('/members', [\App\Http\Controllers\Api\Library\LibraryController::class, 'members']);
        
        // Extended Library routes
        Route::get('/settings', [\App\Http\Controllers\Api\Library\LibraryController::class, 'getSettings']);
        Route::put('/settings', [\App\Http\Controllers\Api\Library\LibraryController::class, 'updateSettings']);
        Route::get('/members/list', [\App\Http\Controllers\Api\Library\LibraryController::class, 'membersList']);
        Route::get('/members/{id}/history', [\App\Http\Controllers\Api\Library\LibraryController::class, 'memberHistory']);
        Route::get('/fines', [\App\Http\Controllers\Api\Library\LibraryController::class, 'fines']);
        Route::post('/fines/{id}/pay', [\App\Http\Controllers\Api\Library\LibraryController::class, 'payFine']);
        Route::post('/fines/{id}/waive', [\App\Http\Controllers\Api\Library\LibraryController::class, 'waiveFine']);
        Route::get('/analytics', [\App\Http\Controllers\Api\Library\LibraryController::class, 'analytics']);
    });

    // Parent Routes
    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/enfants', [\App\Http\Controllers\Api\ParentPortalController::class, 'children']);
        Route::get('/enfants/{id}/notes', [\App\Http\Controllers\Api\ParentPortalController::class, 'childGrades']);
        Route::get('/enfants/{id}/presences', [\App\Http\Controllers\Api\ParentPortalController::class, 'childAttendance']);
        Route::get('/enfants/{id}/emploi-du-temps', [\App\Http\Controllers\Api\ParentPortalController::class, 'childTimetable']);
        Route::get('/enfants/{id}/solde', [\App\Http\Controllers\Api\ParentPortalController::class, 'childBalance']);
        Route::get('/enfants/{id}/bulletins', [\App\Http\Controllers\Api\ParentPortalController::class, 'childBulletins']);
        Route::get('/enfants/{id}/livres', [\App\Http\Controllers\Api\ParentPortalController::class, 'childLoans']);
    });

    // Student (Eleve) Routes
    Route::middleware('role:eleve')->prefix('student')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\StudentPortalController::class, 'dashboard']);
        Route::get('/notes', [\App\Http\Controllers\Api\StudentPortalController::class, 'grades']);
        Route::get('/presences', [\App\Http\Controllers\Api\StudentPortalController::class, 'attendance']);
        Route::get('/emploi-du-temps', [\App\Http\Controllers\Api\StudentPortalController::class, 'timetable']);
        Route::get('/supports', [\App\Http\Controllers\Api\StudentPortalController::class, 'supports']);
        Route::get('/devoirs', [\App\Http\Controllers\Api\StudentPortalController::class, 'homework']);
        Route::get('/livres', [\App\Http\Controllers\Api\StudentPortalController::class, 'loans']);
    });

    // Teacher course materials / homework write access
    Route::middleware('role:enseignant,admin')->prefix('teacher')->group(function () {
        Route::get('/supports', [\App\Http\Controllers\Api\CourseMaterialController::class, 'indexSupports']);
        Route::post('/supports', [\App\Http\Controllers\Api\CourseMaterialController::class, 'storeSupport']);
        Route::delete('/supports/{id}', [\App\Http\Controllers\Api\CourseMaterialController::class, 'destroySupport']);

        Route::get('/devoirs', [\App\Http\Controllers\Api\CourseMaterialController::class, 'indexHomework']);
        Route::post('/devoirs', [\App\Http\Controllers\Api\CourseMaterialController::class, 'storeHomework']);
        Route::put('/devoirs/{id}', [\App\Http\Controllers\Api\CourseMaterialController::class, 'updateHomework']);
        Route::delete('/devoirs/{id}', [\App\Http\Controllers\Api\CourseMaterialController::class, 'destroyHomework']);
    });

    // Chatbot (Common to Eleve, Parent, etc. & Rate limited)
    Route::middleware(['role:eleve,parent,enseignant,admin', 'throttle:20,1'])->prefix('chatbot')->group(function () {
        Route::post('/message', [\App\Http\Controllers\Api\ChatbotController::class, 'message']);
        Route::get('/history', [\App\Http\Controllers\Api\ChatbotController::class, 'history']);
    });

    // ── Transport Management (admin only) ──────────────────────────────
    Route::middleware('role:admin')->prefix('transport')->group(function () {
        Route::get('/vehicules', [\App\Http\Controllers\Api\TransportController::class, 'indexVehicles']);
        Route::post('/vehicules', [\App\Http\Controllers\Api\TransportController::class, 'storeVehicle']);
        Route::get('/vehicules/{id}', [\App\Http\Controllers\Api\TransportController::class, 'showVehicle']);
        Route::put('/vehicules/{id}', [\App\Http\Controllers\Api\TransportController::class, 'updateVehicle']);
        Route::delete('/vehicules/{id}', [\App\Http\Controllers\Api\TransportController::class, 'destroyVehicle']);

        Route::get('/chauffeurs', [\App\Http\Controllers\Api\TransportController::class, 'indexDrivers']);
        Route::get('/chauffeurs/available', [\App\Http\Controllers\Api\TransportController::class, 'availableDrivers']);
        Route::post('/chauffeurs', [\App\Http\Controllers\Api\TransportController::class, 'storeDriver']);
        Route::get('/chauffeurs/{id}', [\App\Http\Controllers\Api\TransportController::class, 'showDriver']);
        Route::put('/chauffeurs/{id}', [\App\Http\Controllers\Api\TransportController::class, 'updateDriver']);
        Route::delete('/chauffeurs/{id}', [\App\Http\Controllers\Api\TransportController::class, 'destroyDriver']);

        Route::get('/itineraires', [\App\Http\Controllers\Api\TransportController::class, 'indexRoutes']);
        Route::post('/itineraires', [\App\Http\Controllers\Api\TransportController::class, 'storeRoute']);
        Route::get('/itineraires/{id}', [\App\Http\Controllers\Api\TransportController::class, 'showRoute']);
        Route::put('/itineraires/{id}', [\App\Http\Controllers\Api\TransportController::class, 'updateRoute']);
        Route::delete('/itineraires/{id}', [\App\Http\Controllers\Api\TransportController::class, 'destroyRoute']);

        Route::post('/itineraires/{id}/assign', [\App\Http\Controllers\Api\TransportController::class, 'assignStudents']);
        Route::delete('/itineraires/{routeId}/students/{studentId}', [\App\Http\Controllers\Api\TransportController::class, 'removeStudent']);
    });

    // ── Driver Dashboard & Live Tracking (chauffeur and admin) ──────────
    Route::middleware('role:chauffeur,admin')->prefix('transport')->group(function () {
        Route::get('/driver-route', [\App\Http\Controllers\Api\TransportController::class, 'driverRoute']);
        Route::get('/students/{studentId}/route', [\App\Http\Controllers\Api\TransportController::class, 'getStudentRoute']);
        Route::post('/students/{studentId}/route', [\App\Http\Controllers\Api\TransportController::class, 'saveStudentRoute']);
    });

    // ── Announcements ───────────────────────────────────────
    Route::get('/annonces', [\App\Http\Controllers\Api\AnnouncementController::class, 'index']);  // filtered by role server-side
    Route::get('/annonces/{id}', [\App\Http\Controllers\Api\AnnouncementController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('/annonces', [\App\Http\Controllers\Api\AnnouncementController::class, 'store']);
        Route::put('/annonces/{id}', [\App\Http\Controllers\Api\AnnouncementController::class, 'update']);
        Route::delete('/annonces/{id}', [\App\Http\Controllers\Api\AnnouncementController::class, 'destroy']);
        Route::put('/annonces/{id}/pin', [\App\Http\Controllers\Api\AnnouncementController::class, 'togglePin']);
    });

    // ── Notifications ───────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/me', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
        Route::get('/latest', [\App\Http\Controllers\Api\NotificationController::class, 'latest']);
        Route::put('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markRead']);
        Route::put('/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);
    });

    // ── Admin Statistics ────────────────────────────────────
    Route::middleware('role:admin')->prefix('v1/admin/stats')->group(function () {
        Route::get('overview', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'overview']);
        Route::get('attendance', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'attendance']);
        Route::get('grades', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'grades']);
        Route::get('finance', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'finance']);
        Route::get('upcoming-exams', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'upcomingExams']);
        Route::get('recent-activities', [\App\Http\Controllers\Api\Admin\StatisticsController::class, 'recentActivities']);
    });
});

// --- SaaS Billing & Stripe Webhook Routes (Outside Tenant Subscription Gate) ---
Route::post('/billing/webhook', [\App\Http\Controllers\Api\BillingController::class, 'webhook']);
Route::get('/billing/checkout-success', [\App\Http\Controllers\Api\BillingController::class, 'checkoutSuccess']);
Route::post('/billing/stripe-webhook-simulate', [\App\Http\Controllers\Api\BillingController::class, 'simulateWebhook']);

Route::middleware(['auth:sanctum', 'tenant'])->prefix('billing')->group(function () {
    Route::post('/checkout', [\App\Http\Controllers\Api\BillingController::class, 'checkout']);
    Route::get('/portal', [\App\Http\Controllers\Api\BillingController::class, 'portal']);
});

// --- Super Admin Portal Control Center (Outside Tenant Boundaries) ---
Route::middleware(['auth:sanctum', 'super-admin'])->prefix('super-admin')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Api\SuperAdminController::class, 'stats']);
    Route::get('/stats/revenue-history', [\App\Http\Controllers\Api\SuperAdminController::class, 'revenueHistory']);
    Route::get('/stats/growth-history', [\App\Http\Controllers\Api\SuperAdminController::class, 'growthHistory']);
    Route::get('/billing/revenue', [\App\Http\Controllers\Api\SuperAdminController::class, 'billingRevenue']);
    Route::get('/billing/events', [\App\Http\Controllers\Api\SuperAdminController::class, 'billingEvents']);
    Route::get('/users', [\App\Http\Controllers\Api\SuperAdminController::class, 'listUsers']);
    Route::post('/users/{id}/disable', [\App\Http\Controllers\Api\SuperAdminController::class, 'disableUser']);
    Route::post('/users/{id}/enable', [\App\Http\Controllers\Api\SuperAdminController::class, 'enableUser']);
    Route::post('/users/{id}/reset-password', [\App\Http\Controllers\Api\SuperAdminController::class, 'resetUserPassword']);
    Route::get('/tenants', [\App\Http\Controllers\Api\SuperAdminController::class, 'listTenants']);
    Route::get('/tenants/{id}/detail', [\App\Http\Controllers\Api\SuperAdminController::class, 'tenantDetail']);
    Route::post('/tenants', [\App\Http\Controllers\Api\SuperAdminController::class, 'onboardTenant']);
    Route::post('/tenants/{id}/subscription', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateSubscription']);
    Route::post('/tenants/{id}/limits', [\App\Http\Controllers\Api\SuperAdminController::class, 'updateLimits']);
    Route::post('/impersonate', [\App\Http\Controllers\Api\SuperAdminController::class, 'impersonate']);
    Route::get('/impersonation-history', [\App\Http\Controllers\Api\SuperAdminController::class, 'impersonationHistory']);
    Route::get('/audit-logs', [\App\Http\Controllers\Api\SuperAdminController::class, 'auditLogs']);
    Route::get('/platform/settings', [\App\Http\Controllers\Api\SuperAdminController::class, 'getPlatformSettings']);
    Route::put('/platform/settings', [\App\Http\Controllers\Api\SuperAdminController::class, 'updatePlatformSettings']);
    Route::get('/health', [\App\Http\Controllers\Api\SuperAdminController::class, 'health']);
});

Route::middleware(['auth:sanctum'])->post('/super-admin/stop-impersonation', [\App\Http\Controllers\Api\SuperAdminController::class, 'stopImpersonation']);
