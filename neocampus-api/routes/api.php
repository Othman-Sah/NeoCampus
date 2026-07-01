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
        Route::post('/presences/bulk', function () {
            return response()->json(['message' => 'Bulk attendance submission placeholder.']);
        });
        Route::get('/salaires', [\App\Http\Controllers\Api\SalaryController::class, 'mySalaries']);
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
