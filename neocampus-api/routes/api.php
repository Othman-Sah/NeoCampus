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

    // Admin-only Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('eleves', \App\Http\Controllers\Api\DummyController::class);
        Route::apiResource('classes', \App\Http\Controllers\Api\DummyController::class);
        Route::apiResource('sections', \App\Http\Controllers\Api\DummyController::class);
        Route::apiResource('enseignants', \App\Http\Controllers\Api\DummyController::class);
    });

    // Comptable (Finance) Routes
    Route::middleware('role:comptable,admin')->prefix('finance')->group(function () {
        Route::get('/reports/summary', function () {
            return response()->json(['message' => 'Finance summary report placeholder.']);
        });
    });

    // Enseignant (Teacher) Routes
    Route::middleware('role:enseignant,admin')->prefix('teacher')->group(function () {
        Route::post('/presences/bulk', function () {
            return response()->json(['message' => 'Bulk attendance submission placeholder.']);
        });
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
