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
        Schema::create('adherents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->string('user_type');
            $table->foreignId('etablissement_id')
                ->constrained('etablissements')
                ->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'etablissement_id']);
            $table->index('user_id');
            $table->index('etablissement_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adherents');
    }
};
