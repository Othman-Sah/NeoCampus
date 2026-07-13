<?php

namespace App\Domain\Ports;

use App\Application\DTOs\ChatResponseDTO;

interface ChatbotPortInterface
{
    /**
     * Sends a message to the external LLM provider.
     *
     * @param int $userId
     * @param string $message
     * @param string $systemPrompt
     * @param array $history
     * @return ChatResponseDTO
     */
    public function ask(int $userId, string $message, string $systemPrompt, array $history): ChatResponseDTO;
}
