<?php

namespace App\Application\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditService
{
    public function record(
        Request $request,
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        array $metadata = []
    ): AuditLog {
        $actor = $request->user();

        return AuditLog::create([
            'actor_id' => $actor?->id,
            'actor_type' => $actor?->role ?? 'system',
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
