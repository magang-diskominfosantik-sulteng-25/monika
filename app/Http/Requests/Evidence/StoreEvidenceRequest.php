<?php

namespace App\Http\Requests\Evidence;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvidenceRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'file'          => ['required_without:url_eksternal', 'nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
            'url_eksternal' => ['required_without:file', 'nullable', 'url'],
            'deskripsi'     => ['nullable', 'string', 'max:255'],
        ];
    }
}
