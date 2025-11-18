<?php

namespace App\Http\Requests\Target;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTargetRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $target = $this->route('target');

        $indicatorId = (int) $this->input('indicator_id', $target?->indicator_id);
        $opdId = (int) $this->input('opd_id', $target?->opd_id);
        $periodId = (int) $this->input('period_id', $target?->period_id);

        return [
            'indicator_id'      => ['sometimes', 'required', 'integer', 'exists:indicator_masters,id'],
            'opd_id'            => ['sometimes', 'required', 'integer', 'exists:opds,id'],
            'period_id'         => [
                'sometimes',
                'required',
                'integer',
                'exists:periods,id',
                Rule::unique('targets', 'indicator_id')->where(function ($query) use ($indicatorId, $opdId, $periodId) {
                    return $query->where('indicator_id', $indicatorId)
                        ->where('opd_id', $opdId)
                        ->where('period_id', $periodId);
                })->ignore($target?->id),
            ],
            'nilai_target_num'  => ['nullable', 'numeric'],
            'nilai_target_text' => ['nullable', 'string'],
            'catatan'           => ['nullable', 'string'],
        ];
    }
}
