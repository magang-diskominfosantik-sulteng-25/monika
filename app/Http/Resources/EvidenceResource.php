<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Evidence */
class EvidenceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'achievement_id' => $this->achievement_id,
            'file_path'      => $this->file_path,
            'file_size'      => $this->file_size,
            'file_hash'      => $this->file_hash,
            'url_eksternal'  => $this->url_eksternal,
            'deskripsi'      => $this->deskripsi,
            'uploaded_by'    => $this->uploaded_by,
            'created_at'     => optional($this->created_at)?->toISOString(),
            'updated_at'     => optional($this->updated_at)?->toISOString(),
            'download_url'   => $this->file_path ? route('evidences.download', $this->id) : null,
            'preview_url' => $this->file_path ? route('evidences.preview', $this->id) : null,
        ];
    }
}
