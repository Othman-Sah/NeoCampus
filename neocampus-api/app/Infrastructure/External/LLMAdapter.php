<?php

namespace App\Infrastructure\External;

use App\Domain\Ports\ChatbotPortInterface;
use App\Application\DTOs\ChatResponseDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LLMAdapter implements ChatbotPortInterface
{
    /**
     * Sends a message to the external LLM provider.
     */
    public function ask(int $userId, string $message, string $systemPrompt, array $history): ChatResponseDTO
    {
        $provider = config('chatbot.llm.provider', 'gemini');
        $apiKey = config("chatbot.llm.{$provider}_api_key");

        if (empty($apiKey)) {
            Log::info("No API key configured for {$provider}. Using fallback mock response.");
            return $this->getMockResponse($message);
        }

        try {
            if ($provider === 'gemini') {
                return $this->callGemini($apiKey, $message, $systemPrompt, $history);
            } else {
                return $this->callOpenAI($apiKey, $message, $systemPrompt, $history);
            }
        } catch (\Exception $e) {
            Log::error("Chatbot API Call failed: " . $e->getMessage(), [
                'provider' => $provider,
                'userId' => $userId,
                'exception' => $e
            ]);
            
            // Safe fallback response in case of network issues
            return new ChatResponseDTO("Désolé, je rencontre des difficultés techniques pour me connecter au service d'IA actuellement. Veuillez réessayer dans quelques instants.");
        }
    }

    /**
     * Make Gemini API Call.
     */
    private function callGemini(string $apiKey, string $message, string $systemPrompt, array $history): ChatResponseDTO
    {
        $model = config('chatbot.llm.gemini_model', 'gemini-1.5-flash');
        $url = config('chatbot.llm.api_url') ?: "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";
        
        // Format history to Gemini contents structure
        $contents = [];
        foreach ($history as $msg) {
            $contents[] = [
                'role' => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [
                    ['text' => $msg['content']]
                ]
            ];
        }

        // Add the current user prompt
        $contents[] = [
            'role' => 'user',
            'parts' => [
                ['text' => $message]
            ]
        ];

        // Format request payload
        $payload = [
            'contents' => $contents,
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'maxOutputTokens' => 1024,
            ]
        ];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("{$url}?key={$apiKey}", $payload);

        if ($response->failed()) {
            throw new \Exception("Gemini API error (Status {$response->status()}): " . $response->body());
        }

        $result = $response->json();
        $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        if (empty($reply)) {
            Log::warning("Gemini response is empty or malformed: " . json_encode($result));
            throw new \Exception("Received empty response from Gemini.");
        }

        return new ChatResponseDTO(trim($reply));
    }

    /**
     * Make OpenAI API Call.
     */
    private function callOpenAI(string $apiKey, string $message, string $systemPrompt, array $history): ChatResponseDTO
    {
        $model = config('chatbot.llm.openai_model', 'gpt-4o-mini');
        $url = config('chatbot.llm.api_url') ?: "https://api.openai.com/v1/chat/completions";

        $messages = [];
        
        // Add system prompt first
        $messages[] = [
            'role' => 'system',
            'content' => $systemPrompt
        ];

        // Add history
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        // Add current query
        $messages[] = [
            'role' => 'user',
            'content' => $message
        ];

        $response = Http::withToken($apiKey)
            ->post($url, [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.4,
            ]);

        if ($response->failed()) {
            throw new \Exception("OpenAI API error (Status {$response->status()}): " . $response->body());
        }

        $result = $response->json();
        $reply = $result['choices'][0]['message']['content'] ?? '';

        if (empty($reply)) {
            Log::warning("OpenAI response is empty or malformed: " . json_encode($result));
            throw new \Exception("Received empty response from OpenAI.");
        }

        return new ChatResponseDTO(trim($reply));
    }

    /**
     * Provide static mock responses for testing or fallback when no credentials exist.
     */
    private function getMockResponse(string $message): ChatResponseDTO
    {
        $msgLower = mb_strtolower($message);

        if (str_contains($msgLower, 'note') || str_contains($msgLower, 'grade')) {
            $reply = "D'après vos notes récentes, vous avez :\n- **Mathématiques** : 16.5/20\n- **Physique** : 15.0/20\n- **Français** : 14.0/20\nVotre moyenne générale est estimée à **15.17/20**.";
        } elseif (str_contains($msgLower, 'absence') || str_contains($msgLower, 'retard')) {
            $reply = "Vous avez **1 absence injustifiée** en Français le 05 Juillet 2026, et **2 absences justifiées** (maladie). Tout le reste est en règle !";
        } elseif (str_contains($msgLower, 'emploi') || str_contains($msgLower, 'horaire') || str_contains($msgLower, 'schedule') || str_contains($msgLower, 'temps')) {
            $reply = "Voici votre emploi du temps pour aujourd'hui :\n- **08:30 - 10:30** : Mathématiques avec M. Alaoui\n- **10:45 - 12:45** : Physique avec Mme. Bensouda\n- **14:30 - 16:30** : Histoire-Géo avec M. Tazi\n\nN'oubliez pas votre cahier d'exercices !";
        } elseif (str_contains($msgLower, 'paiement') || str_contains($msgLower, 'frais') || str_contains($msgLower, 'pay') || str_contains($msgLower, 'solde')) {
            $reply = "Votre solde est à jour pour le mois en cours. Cependant, le prochain versement pour les **frais de scolarité (Mois d'Août)** d'un montant de **2,500 MAD** est attendu avant le **05 Août 2026**.";
        } elseif (str_contains($msgLower, 'devoir') || str_contains($msgLower, 'homework') || str_contains($msgLower, 'exercice')) {
            $reply = "Vous avez **2 devoirs à rendre** prochainement :\n1. **Mathématiques** : Exercices 4, 5 et 6 page 112 (pour le 12 Juillet 2026)\n2. **Anglais** : Rédiger un essai de 150 mots sur le sport (pour le 14 Juillet 2026)";
        } else {
            $reply = "Bonjour ! Je suis l'assistant NeoCampus. Je peux vous renseigner sur vos notes, vos absences, votre emploi du temps, vos paiements ou vos devoirs à rendre. Que souhaitez-vous savoir ?";
        }

        return new ChatResponseDTO($reply);
    }
}
