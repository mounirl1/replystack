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
        Schema::create('review_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', ['google', 'booking', 'tripadvisor', 'airbnb']);
            $table->boolean('is_active')->default(true);

            // URLs for extension-based scraping
            $table->string('platform_url')->nullable();
            $table->string('platform_name')->nullable();
            $table->string('label')->nullable(); // For multi-URL platforms like Airbnb

            // OAuth tokens (Google Business Profile)
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->string('account_name')->nullable(); // Google: accounts/{id}
            $table->string('location_id_google')->nullable(); // Google: locations/{id}

            // Sync tracking
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamp('sync_started_at')->nullable(); // Lock mechanism
            $table->string('sync_error')->nullable();
            $table->enum('sync_source', ['api', 'extension', 'apify'])->nullable();

            // Super admin flag for Apify
            $table->boolean('apify_enabled')->default(false);

            $table->timestamps();
            $table->softDeletes();

            // Each location can have only one connection per platform
            $table->unique(['location_id', 'platform']);
            $table->index(['is_active', 'platform']);
            $table->index('apify_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_connections');
    }
};
