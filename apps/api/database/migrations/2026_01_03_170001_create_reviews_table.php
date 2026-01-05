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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', [
                'google',
                'tripadvisor',
                'booking',
                'yelp',
                'facebook',
                'g2',
                'capterra',
                'trustpilot',
            ]);
            $table->string('external_id'); // ID on the source platform
            $table->string('author_name')->nullable();
            $table->string('author_avatar', 500)->nullable();
            $table->unsignedTinyInteger('rating')->nullable(); // 1-5
            $table->text('content')->nullable();
            $table->string('language', 5)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->enum('status', ['pending', 'replied', 'ignored'])->default('pending');
            $table->timestamps();

            // Unique constraint to prevent duplicate reviews
            $table->unique(['platform', 'external_id']);

            // Indexes for efficient querying
            $table->index(['location_id', 'status']);
            $table->index(['location_id', 'published_at', 'id']);
            $table->index(['platform', 'published_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
