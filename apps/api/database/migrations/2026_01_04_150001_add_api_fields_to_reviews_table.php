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
            // Native platform review ID (may differ from external_id for some APIs)
            $table->string('platform_review_id')->nullable()->after('external_id');

            // Timestamp when the response was published on the platform
            $table->timestamp('replied_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn([
                'platform_review_id',
                'replied_at',
            ]);
        });
    }
};
