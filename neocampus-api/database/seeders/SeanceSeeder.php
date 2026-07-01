<?php

namespace Database\Seeders;

use App\Models\Seance;
use App\Models\ChargeHoraire;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class SeanceSeeder extends Seeder
{
    public function run(): void
    {
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        $assignments = ChargeHoraire::all();
        $days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
        $slots = [
            ['08:00', '09:00'],
            ['09:00', '10:00'],
            ['10:00', '11:00'],
            ['11:00', '12:00'],
            ['14:00', '15:00'],
            ['15:00', '16:00'],
            ['16:00', '17:00'],
            ['17:00', '18:00'],
        ];

        foreach ($assignments as $assignment) {
            // Let's try to create 2 sessions per assignment
            $created = 0;
            $attempts = 0;

            while ($created < 2 && $attempts < 20) {
                $attempts++;
                $day = $days[array_rand($days)];
                $slot = $slots[array_rand($slots)];
                $start = $slot[0];
                $end = $slot[1];

                // Check conflict
                $conflict = Seance::where('jour', $day)
                    ->where('etablissement_id', $etablissement->id)
                    ->where(function ($q) use ($start, $end) {
                        $q->where('heure_debut', '<', $end)
                          ->where('heure_fin', '>', $start);
                    })
                    ->where(function ($q) use ($assignment) {
                        $q->where('classe_id', $assignment->classe_id)
                          ->orWhere('enseignant_id', $assignment->enseignant_id);
                    })
                    ->exists();

                if (!$conflict) {
                    Seance::create([
                        'etablissement_id' => $etablissement->id,
                        'jour' => $day,
                        'heure_debut' => $start,
                        'heure_fin' => $end,
                        'classe_id' => $assignment->classe_id,
                        'enseignant_id' => $assignment->enseignant_id,
                        'matiere_id' => $assignment->matiere_id,
                    ]);
                    $created++;
                }
            }
        }
    }
}
