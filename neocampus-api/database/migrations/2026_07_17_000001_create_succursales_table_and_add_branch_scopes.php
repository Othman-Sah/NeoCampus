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
        // 1. Create succursales table
        if (!Schema::hasTable('succursales')) {
            Schema::create('succursales', function (Blueprint $table) {
                $table->id();
                $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
                $table->string('nom');
                $table->string('adresse')->nullable();
                $table->string('telephone')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 2. Add succursale_id to core tables
        $tables = [
            'users',
            'eleves',
            'enseignants',
            'classes',
            'presences',
            'examens',
            'paiements',
            'livres',
            'itineraires',
            'seances'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $blueprint) use ($table) {
                    if (!Schema::hasColumn($table, 'succursale_id')) {
                        $blueprint->foreignId('succursale_id')
                            ->nullable()
                            ->constrained('succursales')
                            ->nullOnDelete();
                    }
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'seances',
            'itineraires',
            'livres',
            'paiements',
            'examens',
            'presences',
            'classes',
            'enseignants',
            'eleves',
            'users'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $blueprint) use ($table) {
                    if (Schema::hasColumn($table, 'succursale_id')) {
                        $blueprint->dropForeign([$table . '_succursale_id_foreign']);
                        $blueprint->dropColumn('succursale_id');
                    }
                });
            }
        }

        Schema::dropIfExists('succursales');
    }
};
