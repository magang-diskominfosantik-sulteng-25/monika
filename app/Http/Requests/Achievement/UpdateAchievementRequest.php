<?php

namespace App\Http\Requests\Achievement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAchievementRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $achievement = $this->route('achievement');

        $indicatorId = (int) $this->input('indicator_id', $achievement?->indicator_id);
        $opdId = (int) $this->input('opd_id', $achievement?->opd_id);
        $periodId = (int) $this->input('period_id', $achievement?->period_id);

        return [
            'indicator_id'        => ['sometimes', 'required', 'integer', 'exists:indicator_masters,id'],
            'opd_id'              => ['sometimes', 'required', 'integer', 'exists:opds,id'],
            'period_id'           => [
                'sometimes',
                'required',
                'integer',
                'exists:periods,id',
                Rule::unique('achievements', 'indicator_id')->where(function ($query) use ($indicatorId, $opdId, $periodId) {
                    return $query->where('indicator_id', $indicatorId)
                        ->where('opd_id', $opdId)
                        ->where('period_id', $periodId);
                })->ignore($achievement?->id),
            ],
            'nilai_realisasi_num'  => ['nullable', 'numeric'],
            'nilai_realisasi_text' => ['nullable', 'string'],
            'catatan'              => ['nullable', 'string'],
        ];
    }
}
