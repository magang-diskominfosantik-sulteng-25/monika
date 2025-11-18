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
            'id'              => $this->id,
            'kode'            => $this->kode,
            'nama'            => $this->nama,
            'jenis'           => $this->jenis,
            'indicator_type'  => $this->indicator_type,
            'satuan'          => $this->satuan,
            'sumber_data'     => $this->sumber_data,
            'frequency'       => $this->frequency,
            'keterangan'      => $this->keterangan,
            'version'         => $this->version,
            'aktif'           => (bool) $this->aktif,
            'created_at'      => optional($this->created_at)?->toISOString(),
            'updated_at'      => optional($this->updated_at)?->toISOString(),
        ];
    }
}
