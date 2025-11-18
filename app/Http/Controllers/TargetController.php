<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Target\StoreTargetRequest;
use App\Http\Requests\Target\UpdateTargetRequest;
use App\Http\Resources\TargetResource;
use App\Models\IndicatorMaster;
use App\Models\Target;
use App\Services\IndicatorValueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TargetController extends Controller
{
    use RecordsAudit;

    public function index(Request $request)
    {
        $query = Target::query()
            ->with(['indicator', 'opd', 'period'])
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')))
            ->when($request->filled('opd_id'), fn ($q) => $q->where('opd_id', $request->integer('opd_id')))
            ->when($request->filled('period_id'), fn ($q) => $q->where('period_id', $request->integer('period_id')))
            ->orderByDesc('updated_at');

        return TargetResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreTargetRequest $request, IndicatorValueService $valueService)
    {
        $validated = $request->validated();
        $indicator = IndicatorMaster::findOrFail($validated['indicator_id']);
        $split = $valueService->splitValueByType($indicator->indicator_type, $validated, 'nilai_target');

        $target = Target::create([
            'indicator_id'      => $validated['indicator_id'],
            'opd_id'            => $validated['opd_id'],
            'period_id'         => $validated['period_id'],
            'nilai_target_num'  => $split['num'],
            'nilai_target_text' => $split['text'],
            'catatan'           => $validated['catatan'] ?? null,
            'created_by'        => Auth::id(),
        ]);

        $target->load(['indicator', 'opd', 'period']);
        $this->recordAudit('create', 'targets', $target->id, null, $target->toArray());

        return (new TargetResource($target))->response()->setStatusCode(201);
    }

    public function show(Target $target)
    {
        $target->load(['indicator', 'opd', 'period']);

        return new TargetResource($target);
    }

    public function update(UpdateTargetRequest $request, Target $target, IndicatorValueService $valueService)
    {
        $before = $target->toArray();
        $validated = $request->validated();

        $indicator = isset($validated['indicator_id'])
            ? IndicatorMaster::findOrFail($validated['indicator_id'])
            : $target->indicator;

        $valuePayload = $validated;

        if (! array_key_exists('nilai_target_num', $valuePayload)) {
            $valuePayload['nilai_target_num'] = $target->nilai_target_num;
        }

        if (! array_key_exists('nilai_target_text', $valuePayload)) {
            $valuePayload['nilai_target_text'] = $target->nilai_target_text;
        }

        $split = $valueService->splitValueByType($indicator->indicator_type, $valuePayload, 'nilai_target');

        $target->fill([
            'indicator_id'      => $validated['indicator_id'] ?? $target->indicator_id,
            'opd_id'            => $validated['opd_id'] ?? $target->opd_id,
            'period_id'         => $validated['period_id'] ?? $target->period_id,
            'nilai_target_num'  => array_key_exists('nilai_target_num', $validated) ? $split['num'] : $target->nilai_target_num,
            'nilai_target_text' => array_key_exists('nilai_target_text', $validated) ? $split['text'] : $target->nilai_target_text,
            'catatan'           => array_key_exists('catatan', $validated) ? $validated['catatan'] : $target->catatan,
        ])->save();

        $target->refresh()->load(['indicator', 'opd', 'period']);

        $this->recordAudit('update', 'targets', $target->id, $before, $target->toArray());

        return new TargetResource($target);
    }

    public function destroy(Target $target)
    {
        $before = $target->toArray();
        $target->delete();
        $this->recordAudit('delete', 'targets', $target->id, $before, null);

        return response()->json(['deleted' => true]);
    }

    public function bulk(Request $request, IndicatorValueService $valueService)
    {
        $payload = $request->validate([
            'items'                       => ['required', 'array', 'max:100'],
            'items.*.indicator_id'        => ['required', 'integer', 'exists:indicator_masters,id'],
            'items.*.opd_id'              => ['required', 'integer', 'exists:opds,id'],
            'items.*.period_id'           => ['required', 'integer', 'exists:periods,id'],
            'items.*.nilai_target_num'    => ['nullable', 'numeric'],
            'items.*.nilai_target_text'   => ['nullable', 'string'],
            'items.*.catatan'             => ['nullable', 'string'],
        ]);

        $ids = [];

        DB::transaction(function () use ($payload, $valueService, &$ids): void {
            foreach ($payload['items'] as $item) {
                $indicator = IndicatorMaster::findOrFail($item['indicator_id']);
                $split = $valueService->splitValueByType($indicator->indicator_type, $item, 'nilai_target');

                $target = Target::firstOrNew([
                    'indicator_id' => $item['indicator_id'],
                    'opd_id'       => $item['opd_id'],
                    'period_id'    => $item['period_id'],
                ]);

                $before = $target->exists ? $target->toArray() : null;

                $target->fill([
                    'nilai_target_num'  => $split['num'],
                    'nilai_target_text' => $split['text'],
                    'catatan'           => $item['catatan'] ?? null,
                ]);

                if (! $target->exists) {
                    $target->created_by = Auth::id();
                }

                $target->save();

                $ids[] = $target->id;
                $this->recordAudit('bulk_upsert', 'targets', $target->id, $before, $target->toArray());
            }
        });

        $targets = Target::with(['indicator', 'opd', 'period'])
            ->whereIn('id', $ids)
            ->get();

        return TargetResource::collection($targets)->additional([
            'meta' => [
                'processed' => count($ids),
            ],
        ]);
    }
}
