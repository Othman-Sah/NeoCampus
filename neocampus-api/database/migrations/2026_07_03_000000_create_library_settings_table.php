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
        Schema::create('library_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->string('key');
            $table->json('value');
            $table->timestamps();

            $table->unique(['etablissement_id', 'key']);
            $table->index('etablissement_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('library_settings');
    }
};
