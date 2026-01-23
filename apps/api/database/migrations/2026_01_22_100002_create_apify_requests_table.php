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
        Schema::create('apify_requests', function (Blueprint $table) {
            $table->id();
            $table->string('run_id')->unique();
            $table->string('actor_id');
            $table->foreignId('review_connection_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'running', 'processing', 'completed', 'failed'])->default('pending');
            $table->enum('platform', ['tripadvisor', 'booking', 'airbnb']);
            $table->integer('reviews_requested')->nullable();
            $table->integer('reviews_received')->nullable();
            $table->text('error_message')->nullable();
            $table->json('request_input')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['review_connection_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apify_requests');
    }
};
