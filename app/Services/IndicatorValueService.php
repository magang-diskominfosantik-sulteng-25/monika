<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class IndicatorValueService
{
    /**
     * @param  array<string, mixed>  $input
     * @return array{num: ?float, text: ?string}
     */
    public function splitValueByType(string $type, array $input, string $prefix): array
    {
        $numericKey = "{$prefix}_num";
        $textKey = "{$prefix}_text";

        $numericInput = $input[$numericKey] ?? null;
        $textInput = $input[$textKey] ?? null;

        $numericValue = null;
        $textValue = null;

        switch ($type) {
            case 'percent':
                if ($numericInput === null || $numericInput === '') {
                    $numericValue = null;
                    break;
                }

                if (!is_numeric($numericInput)) {
                    throw ValidationException::withMessages([
                        $numericKey => __('Nilai harus berupa angka.'),
                    ]);
                }

                $numericValue = (float) $numericInput;

                if ($numericValue < 0 || $numericValue > 100) {
                    throw ValidationException::withMessages([
                        $numericKey => __('Persentase harus berada pada rentang 0 - 100.'),
                    ]);
                }
                break;

            case 'numeric':
            case 'index':
                if ($numericInput === null || $numericInput === '') {
                    $numericValue = null;
                    break;
                }

                if (!is_numeric($numericInput)) {
                    throw ValidationException::withMessages([
                        $numericKey => __('Nilai harus berupa angka.'),
                    ]);
                }

                $numericValue = (float) $numericInput;
                break;

            case 'text':
                if ($textInput === null || $textInput === '') {
                    $textValue = null;
                    break;
                }

                if (!is_string($textInput)) {
                    throw ValidationException::withMessages([
                        $textKey => __('Nilai harus berupa teks.'),
                    ]);
                }

                $textValue = $textInput;
                break;

            default:
                throw new InvalidArgumentException("Unknown indicator type [{$type}]");
        }

        return [
            'num'  => $type === 'text' ? null : $numericValue,
            'text' => $type === 'text' ? $textValue : null,
        ];
    }
}
