<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000,chrome-extension://*,moz-extension://*')),

    'allowed_origins_patterns' => function () {
        // In production, only allow specific extension IDs
        if (app()->environment('production')) {
            $chromeId = env('CHROME_EXTENSION_ID');
            $firefoxId = env('FIREFOX_EXTENSION_ID');

            $patterns = [];

            if ($chromeId) {
                $patterns[] = '#^chrome-extension://' . preg_quote($chromeId, '#') . '$#';
            }

            if ($firefoxId) {
                $patterns[] = '#^moz-extension://' . preg_quote($firefoxId, '#') . '$#';
            }

            return $patterns;
        }

        // In local/development, allow all extensions
        return [
            '#^chrome-extension://.*$#',
            '#^moz-extension://.*$#',
        ];
    },

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
