<?php

namespace App\Application\DTOs;

class ChatResponseDTO
{
    public string $reply;

    public function __construct(string $reply)
    {
        $this->reply = $reply;
    }

    public function toArray(): array
    {
        return [
            'reply' => $this->reply,
        ];
    }
}
