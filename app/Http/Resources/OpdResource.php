<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Opd */
class OpdResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'nama'        => $this->nama,
            'singkatan'   => $this->singkatan,
            'kontak_nama' => $this->kontak_nama,
            'kontak_hp'   => $this->kontak_hp,
            'aktif'       => (bool) $this->aktif,
            'created_at'  => optional($this->created_at)?->toISOString(),
            'updated_at'  => optional($this->updated_at)?->toISOString(),
        ];
    }
}
