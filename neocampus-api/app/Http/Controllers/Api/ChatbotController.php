<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\Chatbot\AskChatbotUseCase;
use App\Application\UseCases\Chatbot\GetChatHistoryUseCase;
use App\Http\Requests\ChatbotMessageRequest;
use App\Http\Resources\ChatMessageResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatbotController extends Controller
{
    private AskChatbotUseCase $askChatbotUseCase;
    private GetChatHistoryUseCase $getChatHistoryUseCase;

    public function __construct(
        AskChatbotUseCase $askChatbotUseCase,
        GetChatHistoryUseCase $getChatHistoryUseCase
    ) {
        $this->askChatbotUseCase = $askChatbotUseCase;
        $this->getChatHistoryUseCase = $getChatHistoryUseCase;
    }

    /**
     * Send a message to the school AI chatbot assistant.
     */
    public function message(ChatbotMessageRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $message = $request->input('message');

        $responseDTO = $this->askChatbotUseCase->execute($userId, $message);

        return response()->json([
            'reply' => $responseDTO->reply
        ], 200);
    }

    /**
     * Retrieve the last 50 chat messages for the authenticated user.
     */
    public function history(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $messages = $this->getChatHistoryUseCase->execute($userId);

        return response()->json([
            'data' => ChatMessageResource::collection($messages)
        ], 200);
    }
}
