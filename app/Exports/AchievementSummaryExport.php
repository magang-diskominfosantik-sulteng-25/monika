<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Collection;

class AchievementSummaryExport implements FromView, ShouldAutoSize
{
    public function __construct(
        private readonly Collection $groupedRows,
        private readonly ?string $selectedOpd
    ) {
    }

    public function view(): View
    {
        return view('exports.achievements', [
            'groupedRows' => $this->groupedRows,
            'selectedOpd' => $this->selectedOpd,
            'generatedAt' => now(),
            'total' => $this->groupedRows->flatten(1)->count(),
        ]);
    }
}
