<?php

namespace App\Application\UseCases\Chatbot;

use App\Models\ChatMessage;

class GetChatHistoryUseCase
{
    /**
     * Retrieve chat history.
     */
    public function execute(int $userId): array
    {
        // Multitenant trait handles scoping by etablissement_id
        return ChatMessage::where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get()
            ->reverse() // return in chronological order
            ->values()
            ->all();
    }
}
