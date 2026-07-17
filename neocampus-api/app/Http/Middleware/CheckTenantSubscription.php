<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            // Super admins are exempt from subscription gates
            if ($user->role === 'super-admin') {
                return $next($request);
            }

            // Exclude authentication and billing portal routes
            if ($request->is('api/auth/*') || $request->is('api/billing/*')) {
                return $next($request);
            }

            $etablissement = $user->etablissement;
            if ($etablissement) {
                $status = $etablissement->subscription_status;
                if ($status !== 'active' && $status !== 'trialing') {
                    return response()->json([
                        'message' => 'Subscription required or past due. Please complete payment.',
                        'errors' => new \stdClass(),
                        'code' => 'PAYMENT_REQUIRED'
                    ], Response::HTTP_PAYMENT_REQUIRED);
                }
            }
        }

        return $next($request);
    }
}
