<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('groupe_frais', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->text('description')->nullable();
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['etablissement_id', 'nom']);
            $table->index('etablissement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groupe_frais');
    }
};
