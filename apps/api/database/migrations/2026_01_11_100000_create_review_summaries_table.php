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
        Schema::create('review_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('location_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('filters_hash', 64)->index();
            $table->json('filters');
            $table->text('summary');
            $table->json('strengths');
            $table->json('improvements');
            $table->json('keywords');
            $table->integer('review_count');
            $table->integer('tokens_used');
            $table->timestamps();

            $table->unique(['user_id', 'filters_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_summaries');
    }
};
