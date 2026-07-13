<?php

namespace App\Application\UseCases\Chatbot;

use App\Domain\Ports\ChatbotPortInterface;
use App\Domain\Ports\ParentPortalPortInterface;
use App\Domain\Ports\StudentPortalPortInterface;
use App\Models\User;
use App\Models\ChatMessage;
use App\Domain\Exceptions\ChatbotRateLimitException;
use App\Application\DTOs\ChatResponseDTO;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class AskChatbotUseCase
{
    private ChatbotPortInterface $chatbotRepository;
    private ParentPortalPortInterface $parentPortalRepository;
    private StudentPortalPortInterface $studentPortalRepository;

    public function __construct(
        ChatbotPortInterface $chatbotRepository,
        ParentPortalPortInterface $parentPortalRepository,
        StudentPortalPortInterface $studentPortalRepository
    ) {
        $this->chatbotRepository = $chatbotRepository;
        $this->parentPortalRepository = $parentPortalRepository;
        $this->studentPortalRepository = $studentPortalRepository;
    }

    /**
     * Coordinate the chatbot process.
     */
    public function execute(int $userId, string $message): ChatResponseDTO
    {
        $user = User::findOrFail($userId);

        // 1. Rate Limiting: max 20 messages per hour per user
        $rateLimitKey = 'chatbot-user-' . $userId;
        $maxAttempts = config('chatbot.rate_limit', 20);

        if (RateLimiter::tooManyAttempts($rateLimitKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            $minutes = ceil($seconds / 60);
            throw new ChatbotRateLimitException(
                "Limite de messages dépassée. Vous avez droit à un maximum de {$maxAttempts} messages par heure. Veuillez réessayer dans {$minutes} minute(s)."
            );
        }

        RateLimiter::hit($rateLimitKey, 3600); // decay in 1 hour (3600 seconds)

        // 2. Fetch recent conversation history (last 10 messages)
        // Multitenant trait handles scoping by etablissement_id
        $history = ChatMessage::where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get()
            ->reverse()
            ->map(function ($msg) {
                return [
                    'role' => $msg->role,
                    'content' => $msg->content,
                ];
            })
            ->toArray();

        // 3. Inject Context dynamically based on user role
        $context = $this->buildContextForUser($user);

        // 4. Construct System Instruction with Safety Guidelines
        $systemPrompt = $this->buildSystemPrompt($user, $context);

        // 5. Call LLM Adapter
        $responseDTO = $this->chatbotRepository->ask($userId, $message, $systemPrompt, $history);

        // 6. Persist message history in DB (Multitenant automatically sets etablissement_id)
        ChatMessage::create([
            'user_id' => $userId,
            'role' => 'user',
            'content' => $message,
        ]);

        ChatMessage::create([
            'user_id' => $userId,
            'role' => 'assistant',
            'content' => $responseDTO->reply,
        ]);

        return $responseDTO;
    }

    /**
     * Build context based on user role.
     */
    private function buildContextForUser(User $user): string
    {
        $context = "";

        if ($user->role === 'parent') {
            $children = $this->parentPortalRepository->getChildren($user->id);
            $context .= "Role: Parent\n";
            $context .= "Parent Name: {$user->prenom} {$user->nom}\n";
            $context .= "Number of Children registered: " . count($children) . "\n\n";

            foreach ($children as $child) {
                $eleveId = $child->id;
                $summary = $this->parentPortalRepository->getChildSummary($user->id, $eleveId);
                $grades = $this->parentPortalRepository->getChildGrades($user->id, $eleveId);
                $attendance = $this->parentPortalRepository->getChildAttendance($user->id, $eleveId);
                $timetable = $this->parentPortalRepository->getChildTimetable($user->id, $eleveId);
                $balance = $this->parentPortalRepository->getChildBalance($user->id, $eleveId);

                $context .= "=== CHILD INFO: {$child->prenom} {$child->nom} (ID: {$eleveId}, Class: " . ($child->classe->nom ?? 'N/A') . ", Matricule: {$child->matricule}) ===\n";
                $context .= "Overall average: " . ($summary['overall_average'] ?? 'N/A') . "/20\n";
                $context .= "Absences this week: " . ($summary['absence_count_this_week'] ?? 0) . "\n";
                
                if (isset($summary['next_payment_due']) && $summary['next_payment_due']) {
                    $context .= "Next payment due: " . $summary['next_payment_due']['montant'] . " MAD due on " . $summary['next_payment_due']['date_echeance'] . "\n";
                } else {
                    $context .= "Next payment due: None / Up to date\n";
                }

                // Balance details
                $solde = $balance['solde']->montant ?? 0.0;
                $context .= "Outstanding balance: {$solde} MAD\n";

                // Grades (limit to 5 latest)
                $context .= "Grades:\n";
                $recentGrades = array_slice($grades, 0, 5);
                if (empty($recentGrades)) {
                    $context .= " - No grades recorded yet.\n";
                } else {
                    foreach ($recentGrades as $g) {
                        $context .= " - Subject: {$g['matiere_nom']}, Exam: {$g['examen_intitule']}, Grade: {$g['valeur']}/20 (Coeff: {$g['coefficient']}, Class Avg: " . ($g['classe_average'] ?? 'N/A') . "), Date: {$g['date']}\n";
                    }
                }

                // Attendance (limit to 5 latest)
                $context .= "Absences & Attendance History:\n";
                $recentAttendance = array_slice($attendance, 0, 5);
                if (empty($recentAttendance)) {
                    $context .= " - No absences or attendance issues recorded.\n";
                } else {
                    foreach ($recentAttendance as $att) {
                        $context .= " - Date: {$att['date']}, Status: {$att['statut']}, Subject: {$att['matiere_nom']}, Time: {$att['heure']}, Justified: " . ($att['justifie'] ? 'Yes' : 'No') . " (" . ($att['motif'] ?: 'No motif') . ")\n";
                    }
                }

                // Timetable (limit to 5 classes)
                $context .= "Timetable schedule:\n";
                $timetableList = array_slice($timetable, 0, 8);
                if (empty($timetableList)) {
                    $context .= " - No timetable records found.\n";
                } else {
                    foreach ($timetableList as $seance) {
                        $teacherNom = ($seance->enseignant && $seance->enseignant->user) ? ($seance->enseignant->user->prenom . ' ' . $seance->enseignant->user->nom) : 'N/A';
                        $context .= " - Day: {$seance->jour}, Time: {$seance->heure_debut} - {$seance->heure_fin}, Subject: " . ($seance->matiere->nom ?? 'N/A') . ", Teacher: {$teacherNom}\n";
                    }
                }
                $context .= "\n";
            }
        } elseif ($user->role === 'eleve') {
            $student = $this->studentPortalRepository->resolveStudent($user->id);
            if ($student) {
                $dashboard = $this->studentPortalRepository->getDashboardData($user->id);
                $grades = $this->studentPortalRepository->getMyGrades($user->id);
                $attendance = $this->studentPortalRepository->getMyAttendance($user->id);
                $timetable = $this->studentPortalRepository->getMyTimetable($user->id);
                $homework = $this->studentPortalRepository->getMyHomework($user->id);

                $context .= "Role: Student (Eleve)\n";
                $context .= "Student Name: {$student->prenom} {$student->nom} (ID: {$student->id}, Class: " . ($student->classe->nom ?? 'N/A') . ", Matricule: {$student->matricule})\n";
                $context .= "Overall average: " . ($dashboard['overall_average'] ?? 'N/A') . "/20\n";
                $context .= "Attendance rate: " . number_format($dashboard['attendance_rate'] ?? 100.0, 2) . "%\n\n";

                // Grades (limit to 5 latest)
                $context .= "Grades:\n";
                $recentGrades = array_slice($grades, 0, 5);
                if (empty($recentGrades)) {
                    $context .= " - No grades recorded yet.\n";
                } else {
                    foreach ($recentGrades as $g) {
                        $context .= " - Subject: {$g['matiere_nom']}, Exam: {$g['examen_intitule']}, Grade: {$g['valeur']}/20 (Coeff: {$g['coefficient']}, Class Avg: " . ($g['classe_average'] ?? 'N/A') . "), Date: {$g['date']}\n";
                    }
                }

                // Attendance (limit to 5 latest)
                $context .= "Absences & Attendance History:\n";
                $recentAttendance = array_slice($attendance, 0, 5);
                if (empty($recentAttendance)) {
                    $context .= " - No absences or attendance issues recorded.\n";
                } else {
                    foreach ($recentAttendance as $att) {
                        $context .= " - Date: {$att['date']}, Status: {$att['statut']}, Subject: {$att['matiere_nom']}, Time: {$att['heure']}, Justified: " . ($att['justifie'] ? 'Yes' : 'No') . " (" . ($att['motif'] ?: 'No motif') . ")\n";
                    }
                }

                // Timetable
                $context .= "Weekly Timetable:\n";
                $timetableList = array_slice($timetable, 0, 8);
                if (empty($timetableList)) {
                    $context .= " - No timetable records found.\n";
                } else {
                    foreach ($timetableList as $seance) {
                        $teacherNom = ($seance->enseignant && $seance->enseignant->user) ? ($seance->enseignant->user->prenom . ' ' . $seance->enseignant->user->nom) : 'N/A';
                        $context .= " - Day: {$seance->jour}, Time: {$seance->heure_debut} - {$seance->heure_fin}, Subject: " . ($seance->matiere->nom ?? 'N/A') . ", Teacher: {$teacherNom}\n";
                    }
                }

                // Homework
                $context .= "Pending Homework:\n";
                $homeworkList = array_slice($homework, 0, 5);
                if (empty($homeworkList)) {
                    $context .= " - No pending homework.\n";
                } else {
                    foreach ($homeworkList as $hw) {
                        $context .= " - Subject: " . ($hw->matiere->nom ?? 'N/A') . ", Title: {$hw->titre}, Due Date: " . ($hw->date_echeance ? $hw->date_echeance->toDateString() : 'N/A') . ", Description: {$hw->description}\n";
                    }
                }
                $context .= "\n";
            } else {
                $context .= "Role: Student (Eleve)\nError: Student record could not be resolved from user account.\n";
            }
        } else {
            // Teacher or Admin or Accountant
            $context .= "Role: " . ucfirst($user->role) . "\n";
            $context .= "User Name: {$user->prenom} {$user->nom}\n";
            $context .= "Context: Not a student or parent. General school personnel.\n";
        }

        return $context;
    }

    /**
     * Formulate the system instruction prompt.
     */
    private function buildSystemPrompt(User $user, string $context): string
    {
        $establishmentName = $user->etablissement->nom ?? 'NeoCampus';

        return <<<EOT
You are the official school AI Assistant for NeoCampus, at the school "{$establishmentName}".
You have access to the authenticated user's private school data injected below.

=== AUTHENTICATED USER PRIVATE CONTEXT DATA ===
{$context}
==============================================

=== SAFETY AND ACCESS CONTROL RULES ===
1. Only answer questions about the student's own data (grades, attendance, schedule, payments, homework).
2. Never reveal or discuss other students' data or any information not present in the private context data.
3. You are strictly READ-ONLY. You cannot perform write operations, schedule exams, record payments, change grades, or change attendance. If requested to perform any changes, politely reply that you are a read-only assistant.
4. Respond in the same language as the user's message (French or English). If the user writes in French, answer in French. If the user writes in English, answer in English.
5. If the user asks something outside the scope of school, or requests general world knowledge unrelated to their dashboard, grades, absences, schedules, payments, or homework, politely redirect them to ask about their school activities.
6. Present data in a beautiful, structured format using Markdown. Use bold texts, lists, and tables where appropriate to make information readable. Keep responses friendly, professional, and concise.
EOT;
    }
}
