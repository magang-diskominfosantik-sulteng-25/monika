<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Support\Collection;

class OpdSummaryExport implements FromView, ShouldAutoSize
{
    public function __construct(
        private readonly Collection $opdSummaries
    ) {
    }

    public function view(): View
    {
        return view('exports.opd_summary', [
            'opdSummaries' => $this->opdSummaries,
            'generatedAt' => now(),
        ]);
    }
}
