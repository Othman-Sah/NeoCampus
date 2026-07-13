<?php

namespace Tests\Feature;

use App\Models\Etablissement;
use App\Models\User;
use App\Models\ChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ChatbotFeatureTest extends TestCase
{
    use RefreshDatabase;

    private Etablissement $etablissementA;
    private Etablissement $etablissementB;
    private User $studentA;
    private User $studentB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->etablissementA = Etablissement::create([
            'nom' => 'GS Etablissement A',
            'code' => 'ETA_A',
        ]);

        $this->etablissementB = Etablissement::create([
            'nom' => 'GS Etablissement B',
            'code' => 'ETA_B',
        ]);

        $this->studentA = User::create([
            'etablissement_id' => $this->etablissementA->id,
            'nom' => 'Student',
            'prenom' => 'Alpha',
            'email' => 'alpha@school.com',
            'password' => bcrypt('password'),
            'role' => 'eleve',
        ]);

        $this->studentB = User::create([
            'etablissement_id' => $this->etablissementB->id,
            'nom' => 'Student',
            'prenom' => 'Beta',
            'email' => 'beta@school.com',
            'password' => bcrypt('password'),
            'role' => 'eleve',
        ]);

        RateLimiter::clear('chatbot-user-' . $this->studentA->id);
        RateLimiter::clear('chatbot-user-' . $this->studentB->id);
    }

    /**
     * Test history is empty initially.
     */
    public function test_chatbot_history_is_empty_initially(): void
    {
        $response = $this->actingAs($this->studentA)
            ->getJson('/api/chatbot/history');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    /**
     * Test sending message returns reply and persists to history.
     */
    public function test_sending_message_returns_reply_and_updates_history(): void
    {
        $response = $this->actingAs($this->studentA)
            ->postJson('/api/chatbot/message', [
                'message' => 'Quelles sont mes notes ?'
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['reply']);

        // Verify history now contains 2 messages (1 user, 1 assistant)
        $historyResponse = $this->actingAs($this->studentA)
            ->getJson('/api/chatbot/history');

        $historyResponse->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $data = $historyResponse->json('data');
        $this->assertEquals('user', $data[0]['role']);
        $this->assertEquals('Quelles sont mes notes ?', $data[0]['content']);
        $this->assertEquals('assistant', $data[1]['role']);
    }

    /**
     * Test tenant isolation (Student B cannot see Student A's history).
     */
    public function test_chatbot_enforces_tenant_isolation(): void
    {
        // Student A sends a message
        ChatMessage::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $this->studentA->id,
            'role' => 'user',
            'content' => 'Top secret question A'
        ]);

        ChatMessage::create([
            'etablissement_id' => $this->etablissementA->id,
            'user_id' => $this->studentA->id,
            'role' => 'assistant',
            'content' => 'Top secret answer A'
        ]);

        // Student B sends a message
        ChatMessage::create([
            'etablissement_id' => $this->etablissementB->id,
            'user_id' => $this->studentB->id,
            'role' => 'user',
            'content' => 'Top secret question B'
        ]);

        // Student A retrieves history
        $responseA = $this->actingAs($this->studentA)->getJson('/api/chatbot/history');
        $responseA->assertStatus(200)->assertJsonCount(2, 'data');
        
        $dataA = $responseA->json('data');
        $this->assertEquals('Top secret question A', $dataA[0]['content']);

        // Student B retrieves history (should only see their 1 message, none of A's)
        $responseB = $this->actingAs($this->studentB)->getJson('/api/chatbot/history');
        $responseB->assertStatus(200)->assertJsonCount(1, 'data');
        
        $dataB = $responseB->json('data');
        $this->assertEquals('Top secret question B', $dataB[0]['content']);
    }

    /**
     * Test chatbot message rate limit.
     */
    public function test_chatbot_enforces_rate_limiting(): void
    {
        // Override config rate limit to 2 for easier testing
        config(['chatbot.rate_limit' => 2]);

        // First message -> OK
        $this->actingAs($this->studentA)
            ->postJson('/api/chatbot/message', ['message' => 'First message'])
            ->assertStatus(200);

        // Second message -> OK
        $this->actingAs($this->studentA)
            ->postJson('/api/chatbot/message', ['message' => 'Second message'])
            ->assertStatus(200);

        // Third message -> Too many requests (429)
        $response = $this->actingAs($this->studentA)
            ->postJson('/api/chatbot/message', ['message' => 'Third message']);

        $response->assertStatus(429)
            ->assertJson([
                'code' => 'CHATBOT_RATE_LIMIT_EXCEEDED'
            ]);
    }
}
