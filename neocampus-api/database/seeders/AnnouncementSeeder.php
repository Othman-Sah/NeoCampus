<?php

namespace Database\Seeders;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\Annonce;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_US');
        $etablissement = Etablissement::first();
        if (!$etablissement) {
            return;
        }

        $adminUser = User::where('role', 'admin')->first();
        if (!$adminUser) {
            return;
        }

        $announcements = [
            [
                'titre' => 'Welcome to the New Academic Semester 2026!',
                'contenu' => '<h3>Dear Students, Parents, and Teachers,</h3><p>We are thrilled to welcome you back for the new semester! This year, we have introduced updated labs, new sports programs, and enhanced library facilities to support our students\' academic journey.</p><p>Please check your personalized timetable and make sure to attend the opening assembly on Monday morning at 08:30 AM.</p><p>Best regards,<br/><strong>School Administration</strong></p>',
                'target_roles' => ['*'],
                'is_pinned' => true,
                'days_ago' => 20,
            ],
            [
                'titre' => 'Staff Coordination Meeting & Syllabus Overview',
                'contenu' => '<p>Dear colleagues,</p><p>There will be a mandatory teaching staff coordination meeting this Wednesday at 03:00 PM in the Main Conference Room.</p><p>We will discuss the following agenda:</p><ul><li>Midterm assessment schedules</li><li>Grade submission windows</li><li>Integration of digital modules</li></ul><p>Please bring your syllabus drafts for review.</p>',
                'target_roles' => ['enseignant', 'admin'],
                'is_pinned' => false,
                'days_ago' => 15,
            ],
            [
                'titre' => 'Parent-Teacher Conference (PTC) Scheduling',
                'contenu' => '<p>Dear Parents,</p><p>Our quarterly Parent-Teacher conferences will take place next Friday, July 17th, from 09:00 AM to 04:00 PM. This is an opportunity to discuss your child\'s grades, attendance, and overall classroom performance.</p><p>Slots must be booked online through the portal under the "Meetings" tab. Booking window closes on Wednesday.</p><p>Thank you for your cooperation,</p>',
                'target_roles' => ['parent', 'admin'],
                'is_pinned' => false,
                'days_ago' => 10,
            ],
            [
                'titre' => 'School Bus Fleet Maintenance Schedule',
                'contenu' => '<p>Attention Drivers,</p><p>The monthly vehicle inspection and maintenance checks will take place this Saturday from 08:00 AM to 02:00 PM at the main garage.</p><p>All active buses must be parked at the designated bays by Friday evening. Please report any mechanical issues directly to the transport manager beforehand.</p>',
                'target_roles' => ['chauffeur', 'admin'],
                'is_pinned' => false,
                'days_ago' => 5,
            ],
            [
                'titre' => 'Final Exam Timetables and Rules',
                'contenu' => '<h3>Important Notice: Final Exam Rules</h3><p>All students are advised to review the final exam schedule published in the portal. Please note the following strict regulations:</p><ol><li>Arrive 15 minutes before the exam starts.</li><li>Bring valid student ID.</li><li>No electronic devices, smartwatches, or phones are allowed in the exam halls.</li></ol><p>We wish all students the best of luck!</p>',
                'target_roles' => ['eleve', 'parent', 'admin'],
                'is_pinned' => true,
                'days_ago' => 2,
            ],
        ];

        foreach ($announcements as $ann) {
            $publishedAt = now()->subDays($ann['days_ago'])->subHours(rand(1, 10));
            Annonce::create([
                'etablissement_id' => $etablissement->id,
                'user_id' => $adminUser->id,
                'titre' => $ann['titre'],
                'contenu' => $ann['contenu'],
                'extrait' => substr(strip_tags($ann['contenu']), 0, 150) . '...',
                'target_roles' => $ann['target_roles'],
                'is_pinned' => $ann['is_pinned'],
                'published_at' => $publishedAt,
                'created_at' => $publishedAt,
                'updated_at' => $publishedAt,
            ]);
        }
    }
}
