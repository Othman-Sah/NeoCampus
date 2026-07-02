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

    // Admin-only Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/eleves/{id}/avatar', [\App\Http\Controllers\Api\StudentController::class, 'uploadAvatar']);
        Route::post('/eleves/{id}/reveal-password', [\App\Http\Controllers\Api\StudentController::class, 'revealPassword']);
        Route::put('/eleves/{id}/password', [\App\Http\Controllers\Api\StudentController::class, 'updatePassword']);
        Route::apiResource('eleves', \App\Http\Controllers\Api\StudentController::class);
        Route::apiResource('classes', \App\Http\Controllers\Api\ClassController::class);
        Route::get('academic-years', [\App\Http\Controllers\Api\ClassController::class, 'academicYears']);
        Route::apiResource('sections', \App\Http\Controllers\Api\SectionController::class);
        Route::get('subjects', [\App\Http\Controllers\Api\TeacherController::class, 'subjects']);
        Route::post('enseignants/assign', [\App\Http\Controllers\Api\TeacherController::class, 'assign']);
        Route::post('enseignants/unassign', [\App\Http\Controllers\Api\TeacherController::class, 'unassign']);
        Route::post('/enseignants/{id}/avatar', [\App\Http\Controllers\Api\TeacherController::class, 'uploadAvatar']);
        Route::apiResource('enseignants', \App\Http\Controllers\Api\TeacherController::class);
        Route::post('/enseignants/{id}/reveal-password', [\App\Http\Controllers\Api\TeacherController::class, 'revealPassword']);
    });

    // Comptable (Finance) Routes
    Route::middleware('role:comptable,admin')->prefix('finance')->group(function () {
        Route::get('/reports/summary', function () {
            return response()->json(['message' => 'Finance summary report placeholder.']);
        });
        Route::apiResource('salaires', \App\Http\Controllers\Api\SalaryController::class);
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
