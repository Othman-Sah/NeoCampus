<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantIsolation
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user || !$user->etablissement_id) {
            return response()->json([
                'message' => 'Tenant isolation violation: Tenant context missing.'
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
