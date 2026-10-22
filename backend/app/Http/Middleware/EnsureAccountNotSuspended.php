<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountNotSuspended
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $user->checkAndAutoReactivateSuspension();

            if ($user->status === 'suspended') {
                $user->currentAccessToken()?->delete();

                $durationText = $user->suspended_until
                    ? "until {$user->suspended_until->format('Y-m-d H:i:s')} UTC"
                    : 'indefinitely';

                return response()->json([
                    'message' => "Your account has been suspended {$durationText}. Reason: {$user->suspension_reason}",
                    'account_suspended' => true,
                    'suspension_reason' => $user->suspension_reason,
                    'suspended_until' => $user->suspended_until?->toIso8601String(),
                ], 403);
            }
        }

        return $next($request);
    }
}
