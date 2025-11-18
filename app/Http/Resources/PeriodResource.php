<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Period */
class PeriodResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'frequency'  => $this->frequency,
            'tahun'      => $this->tahun,
            'quarter'    => $this->quarter,
            'month'      => $this->month,
            'period_key' => $this->period_key,
            'label'      => $this->label,
            'start_date' => optional($this->start_date)?->toDateString(),
            'end_date'   => optional($this->end_date)?->toDateString(),
            'created_at' => optional($this->created_at)?->toISOString(),
            'updated_at' => optional($this->updated_at)?->toISOString(),
        ];
    }
}
