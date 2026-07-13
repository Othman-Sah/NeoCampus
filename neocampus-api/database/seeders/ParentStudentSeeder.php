<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Eleve;
use App\Models\ParentEleve;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ParentStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablissementId = \App\Models\Etablissement::first()?->id;
        if (!$etablissementId) {
            return;
        }

        // Get all students
        $students = Eleve::all();
        if ($students->count() < 10) {
            return; // Requires students seeded first
        }

        // 1. Link default parent@neocampus.com to 3 children in different classes
        $defaultParent = User::where('email', 'parent@neocampus.com')->first();
        if ($defaultParent) {
            $selectedStudents = [];
            $classIds = [];
            foreach ($students as $student) {
                if (!in_array($student->classe_id, $classIds)) {
                    $selectedStudents[] = $student;
                    $classIds[] = $student->classe_id;
                }
                if (count($selectedStudents) === 3) {
                    break;
                }
            }

            foreach ($selectedStudents as $idx => $student) {
                $relation = $idx === 0 ? 'Father' : ($idx === 1 ? 'Mother' : 'Guardian');
                ParentEleve::updateOrCreate(
                    [
                        'parent_user_id' => $defaultParent->id,
                        'eleve_id' => $student->id,
                    ],
                    [
                        'relation' => $relation,
                    ]
                );

                // Sync JSON for backward compatibility testing
                $contact = $student->parent_contact ?? [];
                $contact['email'] = $defaultParent->email;
                $contact['relation'] = $relation;
                $student->parent_contact = $contact;
                $student->save();
            }
        }

        // 2. Create 5 other parent users and link them to 1-2 children
        for ($i = 1; $i <= 5; $i++) {
            $email = "parent{$i}@neocampus.com";
            $parent = User::firstOrCreate(
                ['email' => $email],
                [
                    'etablissement_id' => $etablissementId,
                    'nom' => "Parent{$i}",
                    'prenom' => "Test",
                    'password' => Hash::make('password123'),
                    'role' => 'parent',
                ]
            );

            // Get a slice of students
            $startIndex = 3 + ($i * 2);
            $slice = $students->slice($startIndex, $i % 2 === 0 ? 2 : 1);

            foreach ($slice as $idx => $student) {
                $relation = $idx === 0 ? 'Father' : 'Mother';
                ParentEleve::updateOrCreate(
                    [
                        'parent_user_id' => $parent->id,
                        'eleve_id' => $student->id,
                    ],
                    [
                        'relation' => $relation,
                    ]
                );

                // Sync JSON
                $contact = $student->parent_contact ?? [];
                $contact['email'] = $parent->email;
                $contact['relation'] = $relation;
                $student->parent_contact = $contact;
                $student->save();
            }
        }
    }
}
