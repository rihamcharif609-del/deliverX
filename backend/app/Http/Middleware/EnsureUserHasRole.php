<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->isSuspended()) {
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

        if (! in_array($user->role->value, $roles, true)) {
            return response()->json(['message' => 'Forbidden. Insufficient role permissions.'], 403);
        }

        return $next($request);
    }
}
