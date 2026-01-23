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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('plan');

            // For TriggerFlow integration: link to external user
            $table->string('external_user_id')->nullable()->after('is_super_admin');
            $table->string('external_source')->nullable()->after('external_user_id');

            $table->index(['external_user_id', 'external_source'], 'users_external_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_external_lookup_index');
            $table->dropColumn(['is_super_admin', 'external_user_id', 'external_source']);
        });
    }
};
