<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Achievement */
class AchievementResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $targetValue = null;

        if ($this->relationLoaded('target') && $this->target) {
            $targetValue = $this->target->nilai_target_num;
        }

        $achievementValue = $this->nilai_realisasi_num;
        $achievementRate = null;

        if ($achievementValue !== null && $targetValue !== null && (float) $targetValue !== 0.0) {
            $achievementRate = round(((float) $achievementValue / (float) $targetValue) * 100, 2);
        }

        return [
            'id'                   => $this->id,
            'indicator_id'         => $this->indicator_id,
            'opd_id'               => $this->opd_id,
            'period_id'            => $this->period_id,
            'nilai_realisasi_num'  => $achievementValue !== null ? (float) $achievementValue : null,
            'nilai_realisasi_text' => $this->nilai_realisasi_text,
            'catatan' => $this->catatan,
            'created_by'           => $this->created_by,
            'updated_by'           => $this->updated_by,
            'created_at'           => optional($this->created_at)?->toISOString(),
            'updated_at'           => optional($this->updated_at)?->toISOString(),
            'target_value'         => $targetValue !== null ? (float) $targetValue : null,
            'achievement_rate'     => $achievementRate,
            'indicator'            => $this->whenLoaded('indicator', fn () => [
                'id'             => $this->indicator->id,
                'nama'           => $this->indicator->nama,
                'indicator_type' => $this->indicator->indicator_type,
                'jenis'          => $this->indicator->jenis,
                'satuan'         => $this->indicator->satuan,
            ]),
            'opd'                  => $this->whenLoaded('opd', fn () => [
                'id'   => $this->opd->id,
                'nama' => $this->opd->nama,
            ]),
            'period'               => $this->whenLoaded('period', fn () => [
                'id'        => $this->period->id,
                'label'     => $this->period->label,
                'period_key'=> $this->period->period_key,
                'tahun'     => $this->period->tahun,
            ]),
            'target'               => $this->whenLoaded('target', fn () => [
                'id'                => $this->target->id,
                'nilai_target_num'  => $this->target->nilai_target_num !== null ? (float) $this->target->nilai_target_num : null,
                'nilai_target_text' => $this->target->nilai_target_text,
            ]),
            'evidences'            => EvidenceResource::collection($this->whenLoaded('evidences')),
        ];
    }
}
