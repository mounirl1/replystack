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
            // Alert settings
            $table->boolean('alerts_enabled')->default(false)->after('auto_fetch_enabled');
            $table->string('alert_email')->nullable()->after('alerts_enabled');
            $table->string('alert_slack_webhook')->nullable()->after('alert_email');

            // Negative trend alert thresholds
            $table->integer('alert_negative_threshold')->default(3)->after('alert_slack_webhook');
            $table->integer('alert_negative_window_days')->default(7)->after('alert_negative_threshold');
            $table->decimal('alert_sentiment_threshold', 3, 2)->default(0.40)->after('alert_negative_window_days');

            // Alert on specific conditions
            $table->boolean('alert_on_1_star')->default(true)->after('alert_sentiment_threshold');
            $table->boolean('alert_on_2_star')->default(false)->after('alert_on_1_star');
            $table->boolean('alert_on_negative_trend')->default(true)->after('alert_on_2_star');
            $table->boolean('alert_on_theme_spike')->default(false)->after('alert_on_negative_trend');

            // Last alert sent tracking
            $table->timestamp('last_trend_alert_at')->nullable()->after('alert_on_theme_spike');
            $table->timestamp('last_review_alert_at')->nullable()->after('last_trend_alert_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn([
                'alerts_enabled',
                'alert_email',
                'alert_slack_webhook',
                'alert_negative_threshold',
                'alert_negative_window_days',
                'alert_sentiment_threshold',
                'alert_on_1_star',
                'alert_on_2_star',
                'alert_on_negative_trend',
                'alert_on_theme_spike',
                'last_trend_alert_at',
                'last_review_alert_at',
            ]);
        });
    }
};
