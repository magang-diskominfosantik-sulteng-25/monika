<?php

namespace App\Http\Requests\Achievement;

use Illuminate\Foundation\Http\FormRequest;

class UnlockAchievementRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alasan' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }
}
