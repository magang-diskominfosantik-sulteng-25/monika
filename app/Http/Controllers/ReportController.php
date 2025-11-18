<?php

namespace App\Http\Controllers;

use App\Exports\AchievementSummaryExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\EvidenceResource;
use App\Models\Achievement;
use App\Models\Evidence;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function summary(Request $request)
    {
        $dataset = $this->buildSummaryDataset($request);

        return response()->json($dataset);
    }

    public function matrix(Request $request)
    {
        $records = $this->baseQuery($request)->get();
        Achievement::hydrateTargets($records);

        $matrix = $records->groupBy('opd_id')->map(function (Collection $items) {
            $opd = $items->first()->opd;

            $indicators = $items->groupBy('indicator_id')->map(function (Collection $indicatorItems) {
                $indicator = $indicatorItems->first()->indicator;

                $periods = $indicatorItems->map(function (Achievement $achievement) {
                    return [
                        'period' => $achievement->period->period_key,
                        'status' => $achievement->status,
                        'target' => $achievement->target?->nilai_target_num ?? $achievement->target?->nilai_target_text,
                        'nilai'  => $achievement->nilai_realisasi_num ?? $achievement->nilai_realisasi_text,
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
        ]);

        $dataset = $this->buildSummaryDataset($request);
        $filename = 'achievement-summary-'.now()->format('Ymd_His');

        if (($validated['format'] ?? 'excel') === 'pdf') {
            $pdf = Pdf::loadView('exports.achievements', [
                'dataset'     => $dataset,
                'generatedAt' => now(),
            ])->setPaper('a4', 'landscape');

            return $pdf->download("{$filename}.pdf");
        }

        $rows = collect($dataset['rows'])->map(function (array $row) {
            return [
                $row['opd'],
                $row['indicator'],
                $row['period'],
                $row['status'],
                $row['target'],
                $row['realisasi'],
                $row['achievement_rate'],
            ];
        });

        return Excel::download(new AchievementSummaryExport($rows), "{$filename}.xlsx");
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<Achievement>
     */
    private function baseQuery(Request $request): Builder
    {
        return Achievement::with(['indicator', 'opd', 'period', 'target'])
            ->when($request->filled('period_id'), fn ($q) => $q->where('period_id', $request->integer('period_id')))
            ->when($request->filled('opd_id'), fn ($q) => $q->where('opd_id', $request->integer('opd_id')))
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')));
    }

    private function buildSummaryDataset(Request $request): array
    {
        $records = $this->baseQuery($request)->get();
        Achievement::hydrateTargets($records);

        $counts = [
            'total'  => $records->count(),
            'draft'  => $records->where('status', 'draft')->count(),
            'valid'  => $records->where('status', 'valid')->count(),
            'locked' => $records->where('status', 'locked')->count(),
        ];

        $byOpd = $records->groupBy('opd_id')->map(function (Collection $items) {
            $opd = $items->first()->opd;

            return [
                'opd' => [
                    'id'   => $opd->id,
                    'nama' => $opd->nama,
                ],
                'total'  => $items->count(),
                'locked' => $items->where('status', 'locked')->count(),
            ];
        })->values();

        $byIndicatorType = $records->groupBy(fn (Achievement $achievement) => $achievement->indicator->indicator_type)
            ->map(fn (Collection $items) => $items->count());

        $recent = $records->sortByDesc('updated_at')->take(10)->values()->map(function (Achievement $achievement) {
            return [
                'id'         => $achievement->id,
                'opd'        => $achievement->opd->nama,
                'indicator'  => $achievement->indicator->nama,
                'period'     => $achievement->period->period_key,
                'status'     => $achievement->status,
                'updated_at' => optional($achievement->updated_at)?->toISOString(),
            ];
        });

        $rows = $records->map(function (Achievement $achievement) {
            return [
                'opd'              => $achievement->opd->nama,
                'indicator'        => $achievement->indicator->nama,
                'period'           => $achievement->period->period_key,
                'status'           => $achievement->status,
                'target'           => $achievement->target?->nilai_target_num ?? $achievement->target?->nilai_target_text,
                'realisasi'        => $achievement->nilai_realisasi_num ?? $achievement->nilai_realisasi_text,
                'achievement_rate' => $this->calculateAchievementRate($achievement),
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

    private function calculateAchievementRate(Achievement $achievement): ?float
    {
        $targetValue = $achievement->target?->nilai_target_num;
        $achievementValue = $achievement->nilai_realisasi_num;

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
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')));
    }
}
