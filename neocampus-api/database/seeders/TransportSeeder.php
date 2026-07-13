<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Vehicule;
use App\Models\Chauffeur;
use App\Models\Itineraire;
use App\Models\Eleve;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class TransportSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        // 1. Create Vehicles
        $vehicleBrands = [
            ['brand' => 'Mercedes-Benz', 'model' => 'Sprinter', 'capacity' => 19],
            ['brand' => 'Toyota', 'model' => 'Coaster', 'capacity' => 26],
            ['brand' => 'Ford', 'model' => 'Transit', 'capacity' => 15],
            ['brand' => 'Iveco', 'model' => 'Daily Bus', 'capacity' => 22],
            ['brand' => 'Mercedes-Benz', 'model' => 'Integro', 'capacity' => 45],
            ['brand' => 'Hyundai', 'model' => 'County', 'capacity' => 28],
        ];

        $vehicles = [];
        foreach ($vehicleBrands as $index => $vb) {
            $numCode = str_pad($index + 1, 3, '0', STR_PAD_LEFT);
            $matricule = rand(1000, 9999) . '|A|' . rand(1, 99); // Moroccan plate format simulated
            
            $vehicles[] = Vehicule::create([
                'etablissement_id' => $etablissement->id,
                'matricule' => $matricule,
                'marque' => $vb['brand'],
                'modele' => $vb['model'],
                'capacite' => $vb['capacity'],
                'statut' => $faker->randomElement(['actif', 'actif', 'actif', 'maintenance', 'hors_service']),
                'annee_mise_en_service' => $faker->numberBetween(2018, 2025),
            ]);
        }

        // 2. Create Chauffeur Users & Profiles
        $drivers = [];
        for ($i = 0; $i < 6; $i++) {
            $nom = $faker->lastName;
            $prenom = $faker->firstName;
            
            // Create user account for chauffeur
            $userEmail = $i === 0 ? 'chauffeur@neocampus.com' : strtolower($prenom . '.' . $nom . '@neocampus.com');
            $user = User::firstOrCreate(
                ['email' => $userEmail],
                [
                    'etablissement_id' => $etablissement->id,
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'password' => Hash::make('password123'),
                    'role' => 'chauffeur',
                ]
            );

            // Assign vehicle to driver (4 active, 2 unassigned)
            $assignedVehicleId = ($i < 4 && isset($vehicles[$i])) ? $vehicles[$i]->id : null;

            $drivers[] = Chauffeur::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $nom,
                'prenom' => $prenom,
                'telephone' => $faker->phoneNumber,
                'num_permis' => 'PERM-' . $faker->numberBetween(100000, 999999) . '-' . strtoupper($faker->lexify('??')),
                'vehicule_id' => $assignedVehicleId,
                'user_id' => $user->id,
                'statut' => 'actif',
            ]);
        }

        // 3. Create Routes
        $routeNames = [
            ['name' => 'Tangier Downtown Line', 'zone' => 'Iberia / Boulevard / Medina', 'start' => '07:30', 'end' => '17:30'],
            ['name' => 'California Residential Circuit', 'zone' => 'California / Malabata / Gzenaya', 'start' => '07:15', 'end' => '17:45'],
            ['name' => 'Val Fleuri Express Route', 'zone' => 'Val Fleuri / Casabarata / Branes', 'start' => '07:40', 'end' => '17:20'],
            ['name' => 'Marshan Coastal Line', 'zone' => 'Marshan / Dradeb / Tanja Balia', 'start' => '07:20', 'end' => '17:40'],
        ];

        // Tangier base coordinates: 35.7595 N, -5.8340 W
        $baseLat = 35.7595;
        $baseLng = -5.8340;

        $students = Eleve::all();

        foreach ($routeNames as $index => $rn) {
            $assignedVehicleId = isset($vehicles[$index]) ? $vehicles[$index]->id : null;

            $route = Itineraire::create([
                'etablissement_id' => $etablissement->id,
                'nom' => $rn['name'],
                'zone' => $rn['zone'],
                'description' => 'Daily transport route serving students in the ' . $rn['zone'] . ' areas.',
                'vehicule_id' => $assignedVehicleId,
                'heure_depart' => $rn['start'],
                'heure_retour' => $rn['end'],
                'statut' => 'actif',
            ]);

            // Assign 3 to 8 students to this route with Tangier coordinates adding slight offsets
            if ($students->count() > 0) {
                $assignedCount = rand(4, 7);
                $routeStudents = $students->random(min($assignedCount, $students->count()));

                foreach ($routeStudents as $subIndex => $student) {
                    // Coordinates offset by subIndex to spread them realistically
                    $latOffset = (rand(-80, 80) / 10000.0) + (($subIndex - 2) * 0.002);
                    $lngOffset = (rand(-80, 80) / 10000.0) + (($subIndex - 2) * 0.002);
                    
                    $studentLat = $baseLat + $latOffset;
                    $studentLng = $baseLng + $lngOffset;

                    $route->eleves()->attach($student->id, [
                        'point_ramassage' => $faker->randomElement([
                            'Station Shell ' . $rn['zone'],
                            'Café de Paris Intersection',
                            'Rond-Point ' . $rn['zone'],
                            'Mosquée ' . $rn['zone'] . ' Gate',
                            'Carrefour Express Corner',
                            'Pharmacie ' . $rn['zone'],
                        ]),
                        'latitude' => $studentLat,
                        'longitude' => $studentLng,
                    ]);
                }
            }
        }
    }
}
