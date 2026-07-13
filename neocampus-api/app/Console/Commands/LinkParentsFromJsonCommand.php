<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Eleve;
use App\Models\User;
use App\Models\ParentEleve;

class LinkParentsFromJsonCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'parent:link-from-json';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate parent links from eleves parent_contact JSON to parent_eleve pivot table';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting migration of parent-student links from JSON...');

        $students = Eleve::whereNotNull('parent_contact')->get();
        $linked = 0;
        $unmatched = 0;

        foreach ($students as $student) {
            $parentContact = $student->parent_contact;
            $email = $parentContact['email'] ?? null;
            $relation = $parentContact['relation'] ?? null;

            if (!$email) {
                $this->warn("Student [ID: {$student->id}] {$student->prenom} {$student->nom} has no parent email in contact JSON.");
                $unmatched++;
                continue;
            }

            // Look up parent user by email and role = 'parent'
            $parentUser = User::where('email', $email)
                ->where('role', 'parent')
                ->first();

            if ($parentUser) {
                ParentEleve::updateOrCreate(
                    [
                        'parent_user_id' => $parentUser->id,
                        'eleve_id' => $student->id,
                    ],
                    [
                        'relation' => $relation,
                    ]
                );
                $this->info("Successfully linked Parent [{$email}] to Student [{$student->matricule}] {$student->prenom} {$student->nom}");
                $linked++;
            } else {
                $this->error("No parent user account found with email [{$email}] for student [ID: {$student->id}] {$student->prenom} {$student->nom}");
                $unmatched++;
            }
        }

        $this->info("Migration done! Linked: {$linked}, Unmatched/Skipped: {$unmatched}");

        return 0;
    }
}
