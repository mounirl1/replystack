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
        Schema::table('reviews', function (Blueprint $table) {
            // Link review to its connection (optional, nullable for backward compatibility)
            $table->foreignId('review_connection_id')
                ->nullable()
                ->after('location_id')
                ->constrained()
                ->nullOnDelete();

            // Track the source of this review (api, extension, apify)
            $table->enum('sync_source', ['api', 'extension', 'apify'])->nullable()->after('status');

            $table->index('review_connection_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['review_connection_id']);
            $table->dropColumn(['review_connection_id', 'sync_source']);
        });
    }
};
