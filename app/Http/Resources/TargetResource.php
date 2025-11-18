<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Target */
class TargetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'indicator_id'      => $this->indicator_id,
            'opd_id'            => $this->opd_id,
            'period_id'         => $this->period_id,
            'nilai_target_num'  => $this->nilai_target_num !== null ? (float) $this->nilai_target_num : null,
            'nilai_target_text' => $this->nilai_target_text,
            'catatan'           => $this->catatan,
            'created_by'        => $this->created_by,
            'created_at'        => optional($this->created_at)?->toISOString(),
            'updated_at'        => optional($this->updated_at)?->toISOString(),
            'indicator'         => $this->whenLoaded('indicator', fn () => [
                'id'             => $this->indicator->id,
                'nama'           => $this->indicator->nama,
                'jenis'          => $this->indicator->jenis,
                'indicator_type' => $this->indicator->indicator_type,
                'satuan'         => $this->indicator->satuan,
            ]),
            'opd'               => $this->whenLoaded('opd', fn () => [
                'id'   => $this->opd->id,
                'nama' => $this->opd->nama,
            ]),
            'period'            => $this->whenLoaded('period', fn () => [
                'id'         => $this->period->id,
                'periode'    => $this->period->period_key,
                'tahun'      => $this->period->tahun,
                'label'      => $this->period->label,
                'frequency'  => $this->period->frequency,
            ]),
        ];
    }
}
