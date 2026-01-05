<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            // Google OAuth tokens (encrypted in model)
            $table->text('google_access_token')->nullable()->after('google_place_id');
            $table->text('google_refresh_token')->nullable()->after('google_access_token');
            $table->timestamp('google_token_expires_at')->nullable()->after('google_refresh_token');

            // Facebook OAuth tokens (encrypted in model) - facebook_page_id already exists
            $table->text('facebook_access_token')->nullable()->after('facebook_page_id');
            $table->timestamp('facebook_token_expires_at')->nullable()->after('facebook_access_token');

            // Management URLs for platforms without API
            $table->string('tripadvisor_management_url')->nullable()->after('tripadvisor_id');
            $table->string('booking_management_url')->nullable()->after('booking_id');
            $table->string('yelp_management_url')->nullable()->after('yelp_id');

            // Tracking and configuration
            $table->timestamp('last_api_fetch_at')->nullable()->after('default_language');
            $table->timestamp('last_extension_fetch_at')->nullable()->after('last_api_fetch_at');
            $table->boolean('auto_fetch_enabled')->default(true)->after('last_extension_fetch_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn([
                'google_access_token',
                'google_refresh_token',
                'google_token_expires_at',
                'facebook_access_token',
                'facebook_token_expires_at',
                'tripadvisor_management_url',
                'booking_management_url',
                'yelp_management_url',
                'last_api_fetch_at',
                'last_extension_fetch_at',
                'auto_fetch_enabled',
            ]);
        });
    }
};
