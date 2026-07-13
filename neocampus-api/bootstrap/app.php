<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'tenant' => \App\Http\Middleware\EnsureTenantIsolation::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (\App\Domain\Exceptions\InsufficientStockException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => new \stdClass(),
                'code' => 'INSUFFICIENT_STOCK'
            ], 422);
        });

        $exceptions->render(function (\App\Domain\Exceptions\LoanAlreadyReturnedException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => new \stdClass(),
                'code' => 'LOAN_ALREADY_RETURNED'
            ], 422);
        });

        $exceptions->render(function (\App\Domain\Exceptions\MaxLoansExceededException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => new \stdClass(),
                'code' => 'MAX_LOANS_EXCEEDED'
            ], 422);
        });

        $exceptions->render(function (\App\Domain\Exceptions\ChatbotRateLimitException $e, Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => new \stdClass(),
                'code' => 'CHATBOT_RATE_LIMIT_EXCEEDED'
            ], 429);
        });
    })->create();
