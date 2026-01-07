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
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->string('city')->nullable()->after('business_name');
            $table->text('seo_keywords')->nullable()->after('city');
            $table->text('main_services')->nullable()->after('seo_keywords');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->dropColumn(['city', 'seo_keywords', 'main_services']);
        });
    }
};
