<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->enum('alert_recap_frequency', ['none', 'daily', 'weekly', 'monthly'])
                ->default('none')
                ->after('alert_on_theme_spike');
            $table->text('alert_recap_emails')->nullable()->after('alert_recap_frequency');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn(['alert_recap_frequency', 'alert_recap_emails']);
        });
    }
};
