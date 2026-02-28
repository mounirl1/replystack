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
        // Alerts webhook for monitoring
        'alerts_webhook_url' => env('SLACK_ALERTS_WEBHOOK_URL'),
    ],

    'anthropic' => [
        'api_key' => env('ANTHROPIC_API_KEY'),
        'model' => env('ANTHROPIC_MODEL', 'claude-3-haiku-20240307'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
    ],

    'mistral' => [
        'api_key' => env('MISTRAL_API_KEY'),
        'model' => env('MISTRAL_MODEL', 'mistral-small-latest'),
    ],

    /*
    |--------------------------------------------------------------------------
    | AI Pricing (for cost estimation)
    |--------------------------------------------------------------------------
    |
    | Cost per 1 million tokens (USD) for each AI provider.
    | Used by Super Admin dashboard to estimate AI costs.
    | These are blended rates (weighted average of input/output).
    |
    */
    'ai_pricing' => [
        'gemini' => [
            'cost_per_million_tokens' => env('AI_GEMINI_COST_PER_MILLION', 0.2325),
        ],
        'mistral' => [
            'cost_per_million_tokens' => env('AI_MISTRAL_COST_PER_MILLION', 0.25),
        ],
        'claude' => [
            'cost_per_million_tokens' => env('AI_CLAUDE_COST_PER_MILLION', 0.80),
        ],
    ],

    'lemonsqueezy' => [
        'api_key' => env('LEMONSQUEEZY_API_KEY'),
        'store_id' => env('LEMONSQUEEZY_STORE_ID'),
        'webhook_secret' => env('LEMONSQUEEZY_WEBHOOK_SECRET'),
        // Monthly variants
        'variant_starter_monthly' => env('LEMONSQUEEZY_STARTER_MONTHLY_VARIANT_ID'),
        'variant_pro_monthly' => env('LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID'),
        'variant_business_monthly' => env('LEMONSQUEEZY_BUSINESS_MONTHLY_VARIANT_ID'),
        // Yearly variants
        'variant_starter_yearly' => env('LEMONSQUEEZY_STARTER_YEARLY_VARIANT_ID'),
        'variant_pro_yearly' => env('LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID'),
        'variant_business_yearly' => env('LEMONSQUEEZY_BUSINESS_YEARLY_VARIANT_ID'),
    ],

    'turnstile' => [
        'secret_key' => env('TURNSTILE_SECRET_KEY'),
        'site_key' => env('TURNSTILE_SITE_KEY'),
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

    /*
    |--------------------------------------------------------------------------
    | TriggerFlow Integration
    |--------------------------------------------------------------------------
    |
    | Configuration for TriggerFlow SSO integration. ReplyStack validates
    | TriggerFlow tokens by calling the TriggerFlow API.
    |
    */
    'triggerflow' => [
        'api_url' => env('TRIGGERFLOW_API_URL'),
        'api_key' => env('TRIGGERFLOW_API_KEY'), // For M2M calls if needed
    ],

    /*
    |--------------------------------------------------------------------------
    | Apify Scraping Service
    |--------------------------------------------------------------------------
    |
    | Configuration for Apify actor runs to scrape reviews from platforms
    | that don't have APIs (TripAdvisor, Booking, Airbnb).
    |
    */
    'apify' => [
        'api_token' => env('APIFY_API_TOKEN'),
        'webhook_url' => env('APIFY_WEBHOOK_URL'),
    ],

];
