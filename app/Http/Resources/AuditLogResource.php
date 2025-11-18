<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\AuditLog */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'action'     => $this->action,
            'entity'     => $this->entity,
            'entity_id'  => $this->entity_id,
            'before'     => $this->before,
            'after'      => $this->after,
            'reason'     => $this->reason,
            'created_at' => optional($this->created_at)?->toISOString(),
            'user'       => $this->whenLoaded('user', fn () => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
        ];
    }
}
