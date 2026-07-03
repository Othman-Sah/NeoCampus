<?php

namespace App\Domain\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(string $message = "Ce livre n'a plus d'exemplaires disponibles en stock.")
    {
        parent::__construct($message);
    }
}
