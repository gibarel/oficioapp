<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Locales e idiomas dialectales soportados por OficioApp.
     */
    protected array $supportedLocales = ['es-AR', 'pt-BR', 'en-US'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = config('app.locale', 'es-AR');

        // 1. Prioridad: Query param o Sesión explícita
        if ($request->has('lang') && in_array($request->get('lang'), $this->supportedLocales)) {
            $locale = $request->get('lang');
            Session::put('locale', $locale);
        } elseif (Session::has('locale') && in_array(Session::get('locale'), $this->supportedLocales)) {
            $locale = Session::get('locale');
        } elseif ($request->user() && !empty($request->user()->preferred_locale)) {
            // 2. Preferencia en la base de datos del usuario autenticado
            $locale = $request->user()->preferred_locale;
        } else {
            // 3. Header Accept-Language del navegador
            $browserLocale = $request->preferredLanguage($this->supportedLocales);
            if ($browserLocale) {
                $locale = $browserLocale;
            }
        }

        App::setLocale($locale);

        return $next($request);
    }
}