<?php

namespace App\Domain\Exceptions;

use Exception;

class LoanAlreadyReturnedException extends Exception
{
    public function __construct(string $message = "Cet emprunt a déjà été marqué comme rendu.")
    {
        parent::__construct($message);
    }
}
