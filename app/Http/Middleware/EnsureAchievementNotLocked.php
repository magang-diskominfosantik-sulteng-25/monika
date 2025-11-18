<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAchievementNotLocked
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $achievement = $request->route('achievement');

        if ($achievement instanceof Achievement) {
            $routeName = $request->route()?->getName();

            if ($achievement->isLocked() && $routeName !== 'achievements.unlock') {
                abort(423, __('Realisasi terkunci. Lakukan proses unlock sebelum mengubah data.'));
            }
        }

        return $next($request);
    }
}
