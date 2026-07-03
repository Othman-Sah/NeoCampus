<?php

namespace App\Domain\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class FinanceException extends Exception
{
    protected $statusCode;

    public function __construct(string $message = "", int $statusCode = 400, Exception $previous = null)
    {
        parent::__construct($message, 0, $previous);
        $this->statusCode = $statusCode;
    }

    public function render($request): JsonResponse
    {
        return response()->json([
            'error' => 'FinanceError',
            'message' => $this->getMessage()
        ], $this->statusCode);
    }
}
