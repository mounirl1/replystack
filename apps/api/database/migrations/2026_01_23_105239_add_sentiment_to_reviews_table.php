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
            $table->decimal('sentiment_score', 3, 2)->nullable()->after('language');
            $table->enum('sentiment_label', ['positive', 'neutral', 'negative'])->nullable()->after('sentiment_score');
            $table->json('sentiment_themes')->nullable()->after('sentiment_label');
            $table->timestamp('sentiment_analyzed_at')->nullable()->after('sentiment_themes');

            $table->index('sentiment_label', 'idx_reviews_sentiment_label');
            $table->index('sentiment_score', 'idx_reviews_sentiment_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('idx_reviews_sentiment_label');
            $table->dropIndex('idx_reviews_sentiment_score');
            $table->dropColumn(['sentiment_score', 'sentiment_label', 'sentiment_themes', 'sentiment_analyzed_at']);
        });
    }
};
