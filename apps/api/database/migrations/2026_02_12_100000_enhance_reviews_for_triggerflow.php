<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->unsignedTinyInteger('normalized_rating')->nullable()->after('rating');
            $table->string('title', 500)->nullable()->after('content');
            $table->text('positive_comment')->nullable()->after('title');
            $table->text('negative_comment')->nullable()->after('positive_comment');
            $table->string('reviewer_country', 100)->nullable()->after('author_avatar');
            $table->text('reply')->nullable()->after('status');
            $table->timestamp('reply_date')->nullable()->after('reply');
            $table->boolean('can_reply')->default(false)->after('reply_date');
            $table->string('stay_date', 50)->nullable()->after('can_reply');
            $table->string('room_type', 100)->nullable()->after('stay_date');
            $table->string('traveler_type', 100)->nullable()->after('room_type');
            $table->string('google_review_id', 255)->nullable()->after('platform_review_id');

            $table->index(['location_id', 'normalized_rating']);
            $table->index(['location_id', 'can_reply']);
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['location_id', 'normalized_rating']);
            $table->dropIndex(['location_id', 'can_reply']);

            $table->dropColumn([
                'normalized_rating',
                'title',
                'positive_comment',
                'negative_comment',
                'reviewer_country',
                'reply',
                'reply_date',
                'can_reply',
                'stay_date',
                'room_type',
                'traveler_type',
                'google_review_id',
            ]);
        });
    }
};
