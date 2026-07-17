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
        if (!Schema::hasTable('etablissement_settings')) {
            Schema::create('etablissement_settings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
                $table->string('key');
                $table->json('value');
                $table->timestamps();

                $table->unique(['etablissement_id', 'key']);
                $table->index('etablissement_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etablissement_settings');
    }
};
