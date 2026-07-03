<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('type_frais', function (Blueprint $table) {
            $table->id();
            $table->string('libelle', 100);
            $table->foreignId('groupe_frais_id')->constrained('groupe_frais')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->decimal('montant_par_defaut', 10, 2)->default(0.00);
            $table->timestamps();

            $table->index('groupe_frais_id');
            $table->index('etablissement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('type_frais');
    }
};
