<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('penalites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('frais_id')->constrained('frais')->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->text('motif')->nullable();
            $table->foreignId('applique_par')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('penalites');
    }
};
