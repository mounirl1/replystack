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
            // External integration fields (for TriggerFlow or other external systems)
            $table->string('external_facility_id')->nullable()->after('organization_id');
            $table->string('external_source')->nullable()->after('external_facility_id');

            // Index for fast lookups when syncing from external systems
            $table->index(['external_facility_id', 'external_source'], 'locations_external_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropIndex('locations_external_lookup_index');
            $table->dropColumn(['external_facility_id', 'external_source']);
        });
    }
};
