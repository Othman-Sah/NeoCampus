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
        Schema::table('users', function (Blueprint $table) {
            if (config('database.default') === 'sqlite') {
                $table->string('role')->change();
            } else {
                DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'comptable', 'enseignant', 'bibliothecaire', 'parent', 'eleve', 'chauffeur', 'super-admin') NOT NULL");
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (config('database.default') === 'sqlite') {
                // Keep string
            } else {
                DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'comptable', 'enseignant', 'bibliothecaire', 'parent', 'eleve', 'chauffeur') NOT NULL");
            }
        });
    }
};
