<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\IndicatorMaster */
class IndicatorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama'            => $this->nama,
            'jenis'           => $this->jenis,
            'indicator_type'  => $this->indicator_type,
            'satuan'          => $this->satuan,
            'opd_id' => $this->opd_id,
            'opd' => $this->whenLoaded('opd', fn () => [
                'id' => $this->opd->id,
                'nama' => $this->opd->nama,
            ]),
            'frequency'       => $this->frequency,
            'keterangan'      => $this->keterangan,
            'version'         => $this->version,
            'aktif'           => (bool) $this->aktif,
            'created_at'      => optional($this->created_at)?->toISOString(),
            'updated_at'      => optional($this->updated_at)?->toISOString(),
        ];
    }
}
