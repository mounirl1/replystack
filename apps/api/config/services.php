<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
    ],

    'lemonsqueezy' => [
        'api_key' => env('LEMONSQUEEZY_API_KEY'),
        'store_id' => env('LEMONSQUEEZY_STORE_ID'),
        'webhook_secret' => env('LEMONSQUEEZY_WEBHOOK_SECRET'),
        // Monthly variants
        'variant_starter_monthly' => env('LEMONSQUEEZY_VARIANT_STARTER_MONTHLY'),
        'variant_pro_monthly' => env('LEMONSQUEEZY_VARIANT_PRO_MONTHLY'),
        'variant_business_monthly' => env('LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY'),
        // Yearly variants
        'variant_starter_yearly' => env('LEMONSQUEEZY_VARIANT_STARTER_YEARLY'),
        'variant_pro_yearly' => env('LEMONSQUEEZY_VARIANT_PRO_YEARLY'),
        'variant_business_yearly' => env('LEMONSQUEEZY_VARIANT_BUSINESS_YEARLY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_APP_ID'),
        'client_secret' => env('FACEBOOK_APP_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],

];
