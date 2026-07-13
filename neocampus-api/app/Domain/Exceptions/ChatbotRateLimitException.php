<?php

namespace App\Domain\Exceptions;

use Exception;

class ChatbotRateLimitException extends Exception
{
    public function __construct(string $message = "Limite de messages dépassée. Vous avez droit à un maximum de 20 messages par heure.")
    {
        parent::__construct($message);
    }
}
