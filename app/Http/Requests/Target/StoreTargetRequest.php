<?php

namespace App\Http\Requests\Target;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTargetRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $indicatorId = (int) $this->input('indicator_id');
        $opdId = (int) $this->input('opd_id');
        $periodId = (int) $this->input('period_id');

        return [
            'indicator_id'      => ['required', 'integer', 'exists:indicator_masters,id'],
            'opd_id'            => ['required', 'integer', 'exists:opds,id'],
            'period_id'         => [
                'required',
                'integer',
                'exists:periods,id',
                Rule::unique('targets')->where(function ($query) use ($indicatorId, $opdId) {
                    return $query->where('indicator_id', $indicatorId)
                        ->where('opd_id', $opdId);
                }),
            ],
            'nilai_target_num'  => ['nullable', 'numeric'],
            'nilai_target_text' => ['nullable', 'string'],
            'catatan'           => ['nullable', 'string'],
        ];
    }
}
