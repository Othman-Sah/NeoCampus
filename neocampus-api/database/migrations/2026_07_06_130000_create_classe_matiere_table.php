<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('classe_matiere', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classe_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('matiere_id')->constrained('matieres')->onDelete('cascade');
            $table->foreignId('etablissement_id')->constrained('etablissements')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['classe_id', 'matiere_id', 'etablissement_id'], 'classe_matiere_unique');
        });

        // For every existing charge_horaire, create a classe_matiere record
        $charges = DB::table('charge_horaires')
            ->select('classe_id', 'matiere_id')
            ->distinct()
            ->get();

        foreach ($charges as $charge) {
            $classe = DB::table('classes')->where('id', $charge->classe_id)->first();
            if (!$classe) continue;

            DB::table('classe_matiere')->insertOrIgnore([
                'classe_id' => $charge->classe_id,
                'matiere_id' => $charge->matiere_id,
                'etablissement_id' => $classe->etablissement_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classe_matiere');
    }
};
