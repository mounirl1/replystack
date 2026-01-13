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
            // Flag to indicate if the review already has a response on the platform
            $table->boolean('has_response')->default(false)->after('replied_at');

            // Content of the existing owner response (scraped from platform)
            $table->text('response_content')->nullable()->after('has_response');

            // When the response was published on the platform
            $table->timestamp('response_published_at')->nullable()->after('response_content');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn([
                'has_response',
                'response_content',
                'response_published_at',
            ]);
        });
    }
};
