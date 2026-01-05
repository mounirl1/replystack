<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

/**
 * Set Locale Middleware
 *
 * Detects the preferred language from the Accept-Language header
 * and sets the application locale accordingly.
 */
class SetLocale
{
    /**
     * Supported locales.
     */
    private const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'it', 'pt'];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->detectLocale($request);
        App::setLocale($locale);

        return $next($request);
    }

    /**
     * Detect the preferred locale from the request.
     */
    private function detectLocale(Request $request): string
    {
        // First, check for X-Locale header (explicit preference from frontend)
        $explicitLocale = $request->header('X-Locale');
        if ($explicitLocale && in_array($explicitLocale, self::SUPPORTED_LOCALES)) {
            return $explicitLocale;
        }

        // Parse Accept-Language header
        $acceptLanguage = $request->header('Accept-Language', '');

        if (empty($acceptLanguage)) {
            return config('app.locale', 'en');
        }

        // Parse the Accept-Language header
        $languages = $this->parseAcceptLanguage($acceptLanguage);

        foreach ($languages as $lang) {
            // Extract the primary language code (e.g., 'en' from 'en-US')
            $primaryLang = strtolower(substr($lang, 0, 2));

            if (in_array($primaryLang, self::SUPPORTED_LOCALES)) {
                return $primaryLang;
            }
        }

        return config('app.locale', 'en');
    }

    /**
     * Parse Accept-Language header and return sorted languages by quality.
     *
     * @return array<string>
     */
    private function parseAcceptLanguage(string $header): array
    {
        $languages = [];
        $parts = explode(',', $header);

        foreach ($parts as $part) {
            $part = trim($part);

            // Check for quality value
            if (preg_match('/^([a-zA-Z-]+)(?:;q=([0-9.]+))?$/', $part, $matches)) {
                $lang = $matches[1];
                $quality = isset($matches[2]) ? (float) $matches[2] : 1.0;
                $languages[$lang] = $quality;
            }
        }

        // Sort by quality (descending)
        arsort($languages);

        return array_keys($languages);
    }
}
