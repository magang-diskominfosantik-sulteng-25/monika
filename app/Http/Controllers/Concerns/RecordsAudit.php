<?php

namespace App\Http\Controllers\Concerns;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait RecordsAudit
{
    protected function recordAudit(string $action, string $entity, $entityId, $before = null, $after = null, ?string $reason = null): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action'  => $action,
            'entity'  => $entity,
            'entity_id' => (string) $entityId,
            'before'  => $before ? (array)$before : null,
            'after'   => $after ? (array)$after : null,
            'reason'  => $reason,
        ]);
    }
}
