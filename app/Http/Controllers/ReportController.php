<?php

namespace App\Http\Controllers;

use App\Exports\AchievementSummaryExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\EvidenceResource;
use App\Models\Achievement;
use App\Models\Target;
use App\Models\Evidence;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function options()
    {
        return response()->json([
            'years' => \App\Models\Period::distinct()->orderByDesc('tahun')->pluck('tahun'),
            'types' => \App\Models\IndicatorMaster::JENIS,
        ]);
    }

    public function summary(Request $request)
    {
        $dataset = $this->buildSummaryDataset($request);

        return response()->json($dataset);
    }

    public function matrix(Request $request)
    {
        $records = $this->baseTargetQuery($request)->get();
        $this->hydrateAchievements($records);

        $matrix = $records->groupBy('opd_id')->map(function (Collection $items) {
            $opd = $items->first()->opd;

            $indicators = $items->groupBy('indicator_id')->map(function (Collection $indicatorItems) {
                $indicator = $indicatorItems->first()->indicator;

                $periods = $indicatorItems->map(function (Target $target) {
                    return [
                        'period' => $target->period->period_key,
                        'target' => $target->nilai_target_num ?? $target->nilai_target_text,
                        'nilai' => $target->achievement?->nilai_realisasi_num ?? $target->achievement?->nilai_realisasi_text,
                    ];
                })->values();

                return [
                    'indicator' => [
                        'id'    => $indicator->id,
                        'nama'  => $indicator->nama,
                        'jenis' => $indicator->jenis,
                    ],
                    'periods' => $periods,
                ];
            })->values();

            return [
                'opd' => [
                    'id'   => $opd->id,
                    'nama' => $opd->nama,
                ],
                'indicators' => $indicators,
            ];
        })->values();

        return response()->json([
            'filters' => $this->filters($request),
            'matrix'  => $matrix,
        ]);
    }

    public function evidences(Request $request)
    {
        $query = Evidence::with(['achievement.indicator', 'achievement.opd', 'achievement.period'])
            ->whereHas('achievement', function (Builder $builder) use ($request): void {
                $this->applyAchievementFilters($builder, $request);
            })
            ->latest();

        return EvidenceResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'format' => ['nullable', 'in:excel,pdf'],
            'type' => ['nullable', 'in:detail,summary'],
        ]);

        $dataset = $this->buildSummaryDataset($request);
        $filename = 'achievement-summary-'.now()->format('Ymd_His');

        if ($request->input('type') === 'summary') {
            $groupedRows = collect($dataset['rows'])->groupBy('opd');
            $opdSummaries = $groupedRows->map(function ($rows, $opdName) {
                $avg = $rows->avg('achievement_rate');
                $total = $rows->count();
                $filled = $rows->whereNotNull('achievement_rate')->count();
                $iku = $rows->where('jenis', 'IKU')->count();
                $ikd = $rows->where('jenis', 'IKD')->count();
                $ikk = $rows->where('jenis', 'IKK')->count();

                return [
                    'opd' => $opdName,
                    'total_indicators' => $total,
                    'filled_indicators' => $filled,
                    'iku_count' => $iku,
                    'ikd_count' => $ikd,
                    'ikk_count' => $ikk,
                    'average_achievement' => $avg ?? 0,
                ];
            })->values();

            if (($validated['format'] ?? 'excel') === 'pdf') {
                $pdf = Pdf::loadView('exports.opd_summary', [
                    'opdSummaries' => $opdSummaries,
                    'generatedAt' => now(),
                ])->setPaper('a4', 'portrait');

                return $pdf->download("opd-summary-{$filename}.pdf");
            }

            return Excel::download(new \App\Exports\OpdSummaryExport($opdSummaries), "opd-summary-{$filename}.xlsx");
        }

        // Group rows by OPD
        $groupedRows = collect($dataset['rows'])->groupBy('opd');

        $selectedOpd = null;
        if ($request->filled('opd') && $request->input('opd') !== 'Semua') {
            $opd = \App\Models\Opd::where('singkatan', $request->input('opd'))->first();
            $selectedOpd = $opd ? $opd->nama : $request->input('opd');
        }

        if (($validated['format'] ?? 'excel') === 'pdf') {
            $pdf = Pdf::loadView('exports.achievements', [
                'groupedRows' => $groupedRows,
                'selectedOpd' => $selectedOpd,
                'generatedAt' => now(),
                'total' => $dataset['counts']['total'],
            ])->setPaper('a4', 'landscape');

            return $pdf->download("{$filename}.pdf");
        }

        return Excel::download(new AchievementSummaryExport($groupedRows, $selectedOpd), "{$filename}.xlsx");
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<Target>
     */
    private function baseTargetQuery(Request $request): Builder
    {
        return Target::with(['indicator', 'opd', 'period'])
            ->when($request->filled('period_id'), fn ($q) => $q->where('period_id', $request->integer('period_id')))
            ->when($request->filled('opd_id'), fn ($q) => $q->where('opd_id', $request->integer('opd_id')))
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')))
            ->when($request->filled('tahun'), function ($q) use ($request) {
                $q->whereHas('period', fn ($sq) => $sq->where('tahun', $request->input('tahun')));
            })
            ->when($request->filled('opd') && $request->input('opd') !== 'Semua', function ($q) use ($request) {
                $q->whereHas('opd', fn ($sq) => $sq->where('singkatan', $request->input('opd')));
            })
            ->when($request->filled('jenis') && $request->input('jenis') !== 'Semua', function ($q) use ($request) {
                $q->whereHas('indicator', fn ($sq) => $sq->where('jenis', $request->input('jenis')));
            });
    }

    private function hydrateAchievements(Collection $targets): void
    {
        if ($targets->isEmpty()) {
            return;
        }

        $achievements = Achievement::query()
            ->with('evidences')
            ->whereIn('indicator_id', $targets->pluck('indicator_id'))
            ->whereIn('opd_id', $targets->pluck('opd_id'))
            ->whereIn('period_id', $targets->pluck('period_id'))
            ->get();

        $targets->each(function (Target $target) use ($achievements) {
            $match = $achievements->first(fn (Achievement $a) =>
                $a->indicator_id == $target->indicator_id &&
                $a->opd_id == $target->opd_id &&
                $a->period_id == $target->period_id
            );
            $target->setRelation('achievement', $match);
        });
    }

    private function buildSummaryDataset(Request $request): array
    {
        $records = $this->baseTargetQuery($request)->get();
        $this->hydrateAchievements($records);

        $counts = [
            'total' => $records->count(),
        ];

        $byOpd = $records->groupBy('opd_id')->map(function (Collection $items) {
            $opd = $items->first()->opd;

            return [
                'opd' => [
                    'id'   => $opd->id,
                    'nama' => $opd->nama,
                ],
                'total' => $items->count(),
            ];
        })->values();

        $byIndicatorType = $records->groupBy(fn (Target $target) => $target->indicator->jenis)
            ->map(fn (Collection $items) => $items->count());

        // Recent updates based on achievements
        $recent = Achievement::with(['opd', 'indicator', 'period'])
            ->latest('updated_at')
            ->take(10)
            ->get()
            ->map(function (Achievement $achievement) {
                return [
                    'id' => $achievement->id,
                    'opd' => $achievement->opd->nama,
                    'indicator' => $achievement->indicator->nama,
                    'period' => $achievement->period->period_key,
                    'updated_at' => optional($achievement->updated_at)?->toISOString(),
                ];
            });

        $rows = $records->map(function (Target $target) {
            $targetVal = $target->nilai_target_num ?? $target->nilai_target_text;
            $realisasiVal = $target->achievement?->nilai_realisasi_num ?? $target->achievement?->nilai_realisasi_text;

            $format = function ($v) {
                return is_numeric($v) ? (float) $v : $v;
            };

            return [
                'opd' => $target->opd->nama,
                'indicator' => $target->indicator->nama,
                'jenis' => $target->indicator->jenis,
                'satuan' => $target->indicator->satuan,
                'period' => $target->period->period_key,
                'target' => $format($targetVal),
                'realisasi' => $format($realisasiVal),
                'achievement_rate' => $this->calculateAchievementRate($target),
                'evidences' => $target->achievement?->evidences->map(function ($evidence) {
                    return [
                        'id' => $evidence->id,
                        'description' => $evidence->deskripsi,
                        'file_url' => $evidence->file_path ? Storage::url($evidence->file_path) : null,
                        'external_url' => $evidence->url_eksternal,
                    ];
                }) ?? [],
            ];
        });

        return [
            'filters'           => $this->filters($request),
            'counts'            => $counts,
            'by_opd'            => $byOpd,
            'by_indicator_type' => $byIndicatorType,
            'recent'            => $recent,
            'rows'              => $rows,
        ];
    }

    private function calculateAchievementRate(Target $target): ?float
    {
        $targetValue = $target->nilai_target_num;
        $achievementValue = $target->achievement?->nilai_realisasi_num;

        if ($targetValue !== null && (float) $targetValue !== 0.0 && $achievementValue !== null) {
            return round(((float) $achievementValue / (float) $targetValue) * 100, 2);
        }

        return null;
    }

    private function filters(Request $request): array
    {
        return array_filter([
            'period_id'    => $request->input('period_id'),
            'opd_id'       => $request->input('opd_id'),
            'indicator_id' => $request->input('indicator_id'),
        ], fn ($value) => ! is_null($value));
    }

    private function applyAchievementFilters(Builder $builder, Request $request): void
    {
        $builder
            ->when($request->filled('period_id'), fn ($q) => $q->where('period_id', $request->integer('period_id')))
            ->when($request->filled('opd_id'), fn ($q) => $q->where('opd_id', $request->integer('opd_id')))
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')))
            ->when($request->filled('tahun'), function ($q) use ($request) {
                $q->whereHas('period', fn ($sq) => $sq->where('tahun', $request->input('tahun')));
            })
            ->when($request->filled('opd') && $request->input('opd') !== 'Semua', function ($q) use ($request) {
                $q->whereHas('opd', fn ($sq) => $sq->where('singkatan', $request->input('opd')));
            })
            ->when($request->filled('jenis') && $request->input('jenis') !== 'Semua', function ($q) use ($request) {
                $q->whereHas('indicator', fn ($sq) => $sq->where('jenis', $request->input('jenis')));
            });
    }
}
