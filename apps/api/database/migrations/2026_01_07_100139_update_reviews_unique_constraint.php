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
            // Drop the old unique constraint on (platform, external_id)
            $table->dropUnique(['platform', 'external_id']);

            // Add new unique constraint on (location_id, platform, external_id)
            $table->unique(['location_id', 'platform', 'external_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique(['location_id', 'platform', 'external_id']);

            // Restore the old constraint
            $table->unique(['platform', 'external_id']);
        });
    }
};
