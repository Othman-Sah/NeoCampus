<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\AppNotification;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_US');
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        // Get some users to send notifications to
        $users = User::all();
        if ($users->count() === 0) {
            return;
        }

        $notificationTemplates = [
            'admin' => [
                ['type' => 'systeme', 'titre' => 'Backup Successful', 'contenu' => 'Database backup was completed successfully at 03:00 AM.', 'link' => '/admin/settings'],
                ['type' => 'note', 'titre' => 'Exception Requested', 'contenu' => 'Teacher Test requested a grades window entry exception for 3ème-B Math exam.', 'link' => '/grades'],
            ],
            'enseignant' => [
                ['type' => 'systeme', 'titre' => 'Syllabus Approved', 'contenu' => 'Your physics syllabus for Terminale-C has been approved by the department.', 'link' => '/teacher/exams'],
                ['type' => 'presence', 'titre' => 'Attendance Flagged', 'contenu' => 'High absenteeism noticed in CM1-A. Please review weekly stats.', 'link' => '/attendance'],
            ],
            'parent' => [
                ['type' => 'paiement', 'titre' => 'Receipt Issued', 'contenu' => 'Payment of 1,200 MAD for June school fees has been processed.', 'link' => '/finance'],
                ['type' => 'presence', 'titre' => 'Absence Recorded', 'contenu' => 'Your child was marked absent today in the morning class.', 'link' => '/attendance'],
            ],
            'eleve' => [
                ['type' => 'note', 'titre' => 'Grades Published', 'contenu' => 'Final grades for Mathematics Midterm have been published.', 'link' => '/grades'],
                ['type' => 'annonce', 'titre' => 'Exam Schedule Updated', 'contenu' => 'The exam schedule for Friday has been updated. Check announcements.', 'link' => '/announcements'],
            ],
            'chauffeur' => [
                ['type' => 'transport', 'titre' => 'Route Assignment', 'contenu' => 'You have been assigned to California Residential Circuit route.', 'link' => '/driver/dashboard'],
                ['type' => 'systeme', 'titre' => 'Inspection Notice', 'contenu' => 'Your assigned bus (Sprinter) is scheduled for inspection this Saturday.', 'link' => '/driver/dashboard'],
            ],
        ];

        foreach ($users as $user) {
            $role = $user->role;
            $templates = $notificationTemplates[$role] ?? [
                ['type' => 'annonce', 'titre' => 'New School Policy', 'contenu' => 'Please review the updated campus safety regulations.', 'link' => '/announcements'],
                ['type' => 'systeme', 'titre' => 'Welcome to NeoCampus', 'contenu' => 'Your school portal account is active and configured.', 'link' => '/dashboard'],
            ];

            foreach ($templates as $index => $tpl) {
                $daysAgo = rand(1, 15);
                $dateEnvoi = now()->subDays($daysAgo)->subMinutes(rand(10, 500));
                
                AppNotification::create([
                    'etablissement_id' => $etablissement->id,
                    'target_user_id' => $user->id,
                    'type' => $tpl['type'],
                    'titre' => $tpl['titre'],
                    'contenu' => $tpl['contenu'],
                    'link' => $tpl['link'],
                    'is_read' => $index > 0 ? true : false, // let's leave the first one unread
                    'date_envoi' => $dateEnvoi,
                    'created_at' => $dateEnvoi,
                    'updated_at' => $dateEnvoi,
                ]);
            }
        }
    }
}
