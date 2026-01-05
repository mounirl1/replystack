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
        Schema::create('location_response_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('location_id')->constrained()->onDelete('cascade');

            // Business info
            $table->string('business_sector')->nullable();
            $table->string('business_name');
            $table->string('signature')->nullable();

            // Response settings
            $table->enum('tone', ['professional', 'warm', 'casual', 'luxury', 'dynamic'])->default('professional');
            $table->enum('default_length', ['short', 'medium', 'detailed'])->default('medium');
            $table->enum('negative_strategy', ['empathetic', 'solution', 'contact', 'factual', 'reconquest'])->default('empathetic');

            // Include options
            $table->boolean('include_customer_name')->default(true);
            $table->boolean('include_business_name')->default(true);
            $table->boolean('include_emojis')->default(false);
            $table->boolean('include_invitation')->default(true);
            $table->boolean('include_signature')->default(true);

            // Custom content
            $table->text('highlights')->nullable(); // Things to mention
            $table->text('avoid_topics')->nullable(); // Things to never mention
            $table->text('additional_context')->nullable();

            // Onboarding status
            $table->boolean('onboarding_completed')->default(false);

            $table->timestamps();

            // Each location can only have one profile
            $table->unique('location_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_response_profiles');
    }
};
