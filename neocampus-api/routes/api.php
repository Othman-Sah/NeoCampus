<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/auth/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Authenticated Routes (Tenant Isolated)
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    
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
    Route::middleware('role:admin')->group(function () {
        Route::post('/bulletins/generate', [\App\Http\Controllers\Api\BulletinController::class, 'generate']);
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
    });

    // Parent Routes
    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/enfants', function () {
            return response()->json(['message' => 'Children list placeholder.']);
        });
    });

    // Student (Eleve) Routes
    Route::middleware('role:eleve')->prefix('student')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Student dashboard placeholder.']);
        });
    });

    // Chatbot (Common to Eleve, Parent, etc.)
    Route::middleware('role:eleve,parent,enseignant,admin')->prefix('chatbot')->group(function () {
        Route::post('/message', function () {
            return response()->json(['message' => 'Chatbot message placeholder.']);
        });
    });
});
