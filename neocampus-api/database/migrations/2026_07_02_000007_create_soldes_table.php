<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('soldes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eleve_id')->constrained('eleves')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->decimal('montant_du', 10, 2)->default(0.00);
            $table->decimal('montant_paye', 10, 2)->default(0.00);
            
            // Generated / computed column
            $table->decimal('montant_restant', 10, 2)->storedAs('montant_du - montant_paye');
            
            $table->timestamp('updated_at')->nullable()->useCurrent()->useCurrentOnUpdate();

            $table->unique(['eleve_id', 'etablissement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('soldes');
    }
};
