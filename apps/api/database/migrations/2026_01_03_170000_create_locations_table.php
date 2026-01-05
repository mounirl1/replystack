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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('google_place_id')->nullable();
            $table->string('tripadvisor_id')->nullable();
            $table->string('booking_id')->nullable();
            $table->string('yelp_id')->nullable();
            $table->string('facebook_page_id')->nullable();
            $table->enum('default_tone', ['professional', 'friendly', 'formal', 'casual'])->default('professional');
            $table->string('default_language', 5)->default('auto');
            $table->timestamps();

            // Indexes for faster lookups
            $table->index('user_id');
            $table->index('organization_id');
            $table->index('google_place_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
