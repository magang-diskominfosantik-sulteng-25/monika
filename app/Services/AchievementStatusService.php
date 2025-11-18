<?php

namespace App\Services;

use App\Models\Achievement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AchievementStatusService
{
    public function validate(Achievement $achievement, ?string $note = null): Achievement
    {
        if (! $achievement->isDraft()) {
            throw ValidationException::withMessages([
                'status' => __('Hanya realisasi berstatus draft yang dapat divalidasi.'),
            ]);
        }

        if ($achievement->nilai_realisasi_num === null && blank($achievement->nilai_realisasi_text)) {
            throw ValidationException::withMessages([
                'nilai_realisasi' => __('Nilai realisasi harus diisi sebelum validasi.'),
            ]);
        }

        $achievement->forceFill([
            'status'       => 'valid',
            'validated_by' => Auth::id(),
            'validated_at' => now(),
        ])->save();

        return $achievement->refresh();
    }

    public function lock(Achievement $achievement, ?string $reason = null): Achievement
    {
        if (! $achievement->isValid()) {
            throw ValidationException::withMessages([
                'status' => __('Hanya realisasi berstatus valid yang dapat dikunci.'),
            ]);
        }

        $achievement->forceFill([
            'status'    => 'locked',
            'locked_by' => Auth::id(),
            'locked_at' => now(),
        ])->save();

        return $achievement->refresh();
    }

    public function unlock(Achievement $achievement, string $reason): Achievement
    {
        if (! $achievement->isLocked()) {
            throw ValidationException::withMessages([
                'status' => __('Hanya realisasi berstatus locked yang dapat dibuka.'),
            ]);
        }

        $achievement->forceFill([
            'status'    => 'valid',
            'locked_by' => null,
            'locked_at' => null,
        ])->save();

        return $achievement->refresh();
    }
}
