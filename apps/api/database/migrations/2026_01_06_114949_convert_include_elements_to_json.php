<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add the new JSON column
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->json('include_elements')->nullable()->after('negative_strategy');
        });

        // Step 2: Migrate existing data from boolean columns to JSON
        DB::table('location_response_profiles')->get()->each(function ($profile) {
            $elements = [
                'customer_name' => (bool) $profile->include_customer_name,
                'business_name' => (bool) $profile->include_business_name,
                'emojis' => (bool) $profile->include_emojis,
                'invitation' => (bool) $profile->include_invitation,
                'signature' => (bool) $profile->include_signature,
            ];

            // For existing profiles, apply the same settings to all sentiments
            // This preserves backward compatibility
            DB::table('location_response_profiles')
                ->where('id', $profile->id)
                ->update([
                    'include_elements' => json_encode([
                        'negative' => $elements,
                        'neutral' => $elements,
                        'positive' => $elements,
                    ]),
                ]);
        });

        // Step 3: Drop the old boolean columns
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'include_customer_name',
                'include_business_name',
                'include_emojis',
                'include_invitation',
                'include_signature',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Re-add the boolean columns
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->boolean('include_customer_name')->default(true)->after('negative_strategy');
            $table->boolean('include_business_name')->default(true)->after('include_customer_name');
            $table->boolean('include_emojis')->default(false)->after('include_business_name');
            $table->boolean('include_invitation')->default(true)->after('include_emojis');
            $table->boolean('include_signature')->default(true)->after('include_invitation');
        });

        // Step 2: Migrate data back from JSON (use 'positive' settings as default)
        DB::table('location_response_profiles')->get()->each(function ($profile) {
            if ($profile->include_elements) {
                $elements = json_decode($profile->include_elements, true);
                // Use 'positive' settings as the default when reverting
                $positive = $elements['positive'] ?? [];

                DB::table('location_response_profiles')
                    ->where('id', $profile->id)
                    ->update([
                        'include_customer_name' => $positive['customer_name'] ?? true,
                        'include_business_name' => $positive['business_name'] ?? true,
                        'include_emojis' => $positive['emojis'] ?? false,
                        'include_invitation' => $positive['invitation'] ?? true,
                        'include_signature' => $positive['signature'] ?? true,
                    ]);
            }
        });

        // Step 3: Drop the JSON column
        Schema::table('location_response_profiles', function (Blueprint $table) {
            $table->dropColumn('include_elements');
        });
    }
};
