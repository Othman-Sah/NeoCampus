<?php

namespace App\Domain\Exceptions;

use Exception;

class MaxLoansExceededException extends Exception
{
    public function __construct(string $message = "Limite maximale d'emprunts en cours dépassée pour cet adhérent.")
    {
        parent::__construct($message);
    }
}
