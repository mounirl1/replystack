<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Updates free plan from daily quota (3/day) to monthly quota (10/month).
     */
    public function up(): void
    {
        // Update default monthly_quota for new users (was 0, now 10 for free plan)
        Schema::table('users', function (Blueprint $table) {
            $table->integer('monthly_quota')->default(10)->change();
        });

        // Update existing free plan users to have monthly_quota = 10
        DB::table('users')
            ->where('plan', 'free')
            ->update([
                'monthly_quota' => 10,
                'daily_quota' => 0, // No longer used for free plan
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to daily quota for free plan
        Schema::table('users', function (Blueprint $table) {
            $table->integer('monthly_quota')->default(0)->change();
        });

        // Revert existing free plan users to daily quota
        DB::table('users')
            ->where('plan', 'free')
            ->update([
                'monthly_quota' => 0,
                'daily_quota' => 3,
            ]);
    }
};
