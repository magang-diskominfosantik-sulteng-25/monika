<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Resources\PeriodResource;
use App\Models\Period;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PeriodController extends Controller
{
    use RecordsAudit;
    public function index(Request $request)
    {
        $query = Period::query()
            ->when($request->filled('frequency'), fn ($q) => $q->where('frequency', $request->string('frequency')))
            ->when($request->filled('tahun'), fn ($q) => $q->where('tahun', $request->integer('tahun')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = '%'.$request->string('search').'%';
                return $q->where('period_key', 'like', $search);
            })
            ->orderByDesc('tahun')
            ->orderBy('period_key');

        return PeriodResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function show(Period $period)
    {
        return new PeriodResource($period);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'frequency' => ['required', 'in:annual,semester,quarter,month'],
            'tahun' => ['required', 'integer', 'min:2020', 'max:2100'],
            'quarter' => ['nullable', 'integer', 'min:1', 'max:4', 'required_if:frequency,quarter'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12', 'required_if:frequency,month'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ]);

        // Generate period_key and label
        $periodKey = $this->generatePeriodKey($validated);
        $label = $this->generatePeriodLabel($validated);

        $period = Period::create([
            ...$validated,
            'period_key' => $periodKey,
            'label' => $label,
        ]);

        $this->recordAudit('create', 'periods', $period->id, null, $period->toArray());

        return (new PeriodResource($period))->response()->setStatusCode(201);
    }

    public function update(Request $request, Period $period)
    {
        $validated = $request->validate([
            'frequency' => ['sometimes', 'required', 'in:annual,semester,quarter,month'],
            'tahun' => ['sometimes', 'required', 'integer', 'min:2020', 'max:2100'],
            'quarter' => ['nullable', 'integer', 'min:1', 'max:4'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after:start_date'],
        ]);

        $before = $period->toArray();

        // Update period_key and label if relevant fields changed
        if (isset($validated['frequency']) || isset($validated['tahun']) || isset($validated['quarter']) || isset($validated['month'])) {
            $mergedData = array_merge($period->toArray(), $validated);
            $validated['period_key'] = $this->generatePeriodKey($mergedData);
            $validated['label'] = $this->generatePeriodLabel($mergedData);
        }

        $period->update($validated);
        $this->recordAudit('update', 'periods', $period->id, $before, $period->toArray());

        return new PeriodResource($period);
    }

    public function destroy(Period $period)
    {
        $before = $period->toArray();
        $period->delete();
        $this->recordAudit('delete', 'periods', $period->id, $before, null);

        return response()->json(['deleted' => true]);
    }

    private function generatePeriodKey(array $data): string
    {
        $tahun = $data['tahun'];
        $frequency = $data['frequency'];

        return match ($frequency) {
            'annual' => "{$tahun}",
            'semester' => "{$tahun}-S".($data['quarter'] <= 2 ? '1' : '2'),
            'quarter' => "{$tahun}-Q{$data['quarter']}",
            'month' => "{$tahun}-M".str_pad((string) $data['month'], 2, '0', STR_PAD_LEFT),
            default => "{$tahun}",
        };
    }

    private function generatePeriodLabel(array $data): string
    {
        $tahun = $data['tahun'];
        $frequency = $data['frequency'];

        return match ($frequency) {
            'annual' => "Tahun {$tahun}",
            'semester' => "Semester ".($data['quarter'] <= 2 ? '1' : '2')." {$tahun}",
            'quarter' => "Triwulan {$data['quarter']} {$tahun}",
            'month' => Carbon::create($tahun, $data['month'], 1)->format('F Y'),
            default => "Tahun {$tahun}",
        };
    }
}
