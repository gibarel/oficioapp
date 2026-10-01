<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $locale = app()->getLocale();
        
        // Cargar archivo JSON de traducción según el locale
        $langPath = lang_path("{$locale}.json");
        $translations = file_exists($langPath) 
            ? json_decode(file_get_contents($langPath), true) 
            : [];

        return array_merge(parent::share($request), [
            'locale' => $locale,
            'translations' => $translations,
        ]);
    }
}
