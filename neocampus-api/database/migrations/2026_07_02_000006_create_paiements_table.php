<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frais_id')->constrained('frais')->onDelete('cascade');
            $table->decimal('montant_paye', 10, 2);
            $table->date('date_paiement');
            $table->enum('mode', ['cash', 'virement', 'cheque']);
            $table->string('reference', 100)->nullable();
            $table->foreignId('comptable_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();

            $table->index('frais_id');
            $table->index('etablissement_id');
            $table->index('date_paiement');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
