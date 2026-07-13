<?php

namespace Database\Seeders;

use App\Models\Support;
use App\Models\Devoir;
use App\Models\ChargeHoraire;
use App\Models\Etablissement;
use Illuminate\Database\Seeder;

class CourseMaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        $assignments = ChargeHoraire::all();
        if ($assignments->isEmpty()) {
            return; // Requires TeacherSeeder to have run first
        }

        // 1. Create 15 support entries
        $types = ['document', 'video', 'link', 'image'];
        $supportTitles = [
            'Introduction to Algebra Lecture Notes',
            'Syllabus & Course Outline',
            'Newtonian Mechanics Video Lecture',
            'Grammar Guide: Direct & Indirect Speech',
            'Historical Context of the French Revolution',
            'Cell Structure & Functions Lab Guide',
            'Python Programming Basics Cheat-Sheet',
            'Organic Chemistry Nomenclature Exercises',
            'Geography: World Maps and Capital Cities',
            'Macbeth Analysis & Key Quotes',
            'Linear Equations Practice Sheet',
            'Web Development Course Resource List',
        ];

        for ($i = 0; $i < 15; $i++) {
            $assignment = $assignments->random();
            $title = $supportTitles[$i % count($supportTitles)];
            $type = $types[$i % count($types)];
            
            $fileUrl = null;
            if ($type === 'document') {
                $fileUrl = 'https://neocampus.s3.amazonaws.com/materials/lecture_' . $i . '.pdf';
            } elseif ($type === 'video') {
                $fileUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            } elseif ($type === 'link') {
                $fileUrl = 'https://wikipedia.org/wiki/Special:Random';
            } elseif ($type === 'image') {
                $fileUrl = 'https://neocampus.s3.amazonaws.com/materials/diagram_' . $i . '.png';
            }

            Support::create([
                'etablissement_id' => $etablissement->id,
                'enseignant_id' => $assignment->enseignant_id,
                'classe_id' => $assignment->classe_id,
                'matiere_id' => $assignment->matiere_id,
                'titre' => $title,
                'description' => "This is a helper material. Please read it before our next class.",
                'fichier_url' => $fileUrl,
                'type' => $type,
            ]);
        }

        // 2. Create 10 homework entries
        $homeworkTitles = [
            'Algebra Exercises: Chapter 3 Problems 1 to 10',
            'Physics Lab Report: Force and Motion',
            'French Essay: Write 200 words on your holiday',
            'History Essay: Impacts of World War I',
            'Biology Quiz Prep: Chapters 5 and 6',
            'Python Functions Homework Assignment',
            'Geography Map Coloring: Countries of Africa',
            'English Literature Reading: Macbeth Act III',
            'Chemistry Balancing Equations Sheet',
            'Maths: Quadratic Formula Proofs',
        ];

        $today = now();

        for ($i = 0; $i < 10; $i++) {
            $assignment = $assignments->random();
            $title = $homeworkTitles[$i % count($homeworkTitles)];
            
            $dueOffset = match ($i % 4) {
                0 => -5, // overdue
                1 => 0,  // due today
                2 => 3,  // due in 3 days
                3 => 14, // due in 14 days
            };
            
            $dueDate = $today->copy()->addDays($dueOffset)->toDateString();

            Devoir::create([
                'etablissement_id' => $etablissement->id,
                'enseignant_id' => $assignment->enseignant_id,
                'classe_id' => $assignment->classe_id,
                'matiere_id' => $assignment->matiere_id,
                'titre' => $title,
                'description' => "Please submit this homework on time. This assignment is graded.",
                'date_echeance' => $dueDate,
                'fichier_url' => 'https://neocampus.s3.amazonaws.com/homework/assignment_' . $i . '.pdf',
            ]);
        }
    }
}
