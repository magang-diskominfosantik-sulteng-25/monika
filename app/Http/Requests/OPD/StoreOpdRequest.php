<?php

namespace App\Http\Requests\OPD;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOpdRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'nama'        => ['required', 'string', 'max:255', Rule::unique('opds', 'nama')],
            'singkatan'   => ['nullable', 'string', 'max:50'],
            'kontak_nama' => ['nullable', 'string', 'max:255'],
            'kontak_hp'   => ['nullable', 'string', 'max:30'],
            'aktif'       => ['boolean'],
        ];
    }
}
