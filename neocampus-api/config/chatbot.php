<?php

return [
    'llm' => [
        'provider' => env('CHATBOT_LLM_PROVIDER', 'gemini'), // 'gemini' or 'openai'
        'openai_api_key' => env('OPENAI_API_KEY'),
        'openai_model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'gemini_api_key' => env('GEMINI_API_KEY'),
        'gemini_model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
        'api_url' => env('CHATBOT_API_URL'), // optional custom endpoint
    ],
    'rate_limit' => env('CHATBOT_RATE_LIMIT', 20), // messages per hour
];
