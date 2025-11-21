<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Achievement\StoreAchievementRequest;
use App\Http\Requests\Achievement\UpdateAchievementRequest;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use App\Models\IndicatorMaster;
use App\Services\IndicatorValueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AchievementController extends Controller
{
    use RecordsAudit, AuthorizesRequests;

    public function __construct(
        private readonly IndicatorValueService $valueService,
    ) {}

    public function index(Request $request)
    {
        $query = Achievement::query()
            ->with(['indicator', 'opd', 'period'])
            ->when($request->filled('indicator_id'), fn ($q) => $q->where('indicator_id', $request->integer('indicator_id')))
            ->when($request->filled('opd_id'), fn ($q) => $q->where('opd_id', $request->integer('opd_id')))
            ->when($request->filled('period_id'), fn ($q) => $q->where('period_id', $request->integer('period_id')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = '%'.$request->string('search').'%';
                return $q->where('catatan', 'like', $search);
            })
            ->orderByDesc('updated_at');

        $paginator = $query->paginate($request->integer('per_page', 20));
        Achievement::hydrateTargets($paginator->getCollection());

        return AchievementResource::collection($paginator);
    }

    public function store(StoreAchievementRequest $request)
    {
        $validated = $request->validated();
        $indicator = IndicatorMaster::findOrFail($validated['indicator_id']);
        $split = $this->valueService->splitValueByType($indicator->indicator_type, $validated, 'nilai_realisasi');

        $achievement = Achievement::create([
            'indicator_id'         => $validated['indicator_id'],
            'opd_id'               => $validated['opd_id'],
            'period_id'            => $validated['period_id'],
            'nilai_realisasi_num'  => $split['num'],
            'nilai_realisasi_text' => $split['text'],
            'catatan' => $validated['catatan'] ?? null,
            'created_by'           => Auth::id(),
        ]);

        $achievement->load(['indicator', 'opd', 'period']);
        Achievement::hydrateTargets([$achievement]);
        $this->recordAudit('create', 'achievements', $achievement->id, null, $achievement->toArray());

        return (new AchievementResource($achievement))->response()->setStatusCode(201);
    }

    public function show(Achievement $achievement)
    {
        $achievement->load(['indicator', 'opd', 'period', 'evidences']);
        Achievement::hydrateTargets([$achievement]);

        return new AchievementResource($achievement);
    }

    public function update(UpdateAchievementRequest $request, Achievement $achievement)
    {
        $this->authorize('update', $achievement);

        $before = $achievement->toArray();
        $validated = $request->validated();

        $indicator = isset($validated['indicator_id'])
            ? IndicatorMaster::findOrFail($validated['indicator_id'])
            : $achievement->indicator;

        $valuePayload = $validated;

        if (! array_key_exists('nilai_realisasi_num', $valuePayload)) {
            $valuePayload['nilai_realisasi_num'] = $achievement->nilai_realisasi_num;
        }

        if (! array_key_exists('nilai_realisasi_text', $valuePayload)) {
            $valuePayload['nilai_realisasi_text'] = $achievement->nilai_realisasi_text;
        }

        $split = $this->valueService->splitValueByType($indicator->indicator_type, $valuePayload, 'nilai_realisasi');

        $achievement->fill([
            'indicator_id'         => $validated['indicator_id'] ?? $achievement->indicator_id,
            'opd_id'               => $validated['opd_id'] ?? $achievement->opd_id,
            'period_id'            => $validated['period_id'] ?? $achievement->period_id,
            'nilai_realisasi_num'  => array_key_exists('nilai_realisasi_num', $validated) ? $split['num'] : $achievement->nilai_realisasi_num,
            'nilai_realisasi_text' => array_key_exists('nilai_realisasi_text', $validated) ? $split['text'] : $achievement->nilai_realisasi_text,
            'catatan'              => array_key_exists('catatan', $validated) ? $validated['catatan'] : $achievement->catatan,
            'updated_by'           => Auth::id(),
        ])->save();

        $achievement->refresh()->load(['indicator', 'opd', 'period']);
        Achievement::hydrateTargets([$achievement]);

        $this->recordAudit('update', 'achievements', $achievement->id, $before, $achievement->toArray());

        return new AchievementResource($achievement);
    }

    public function destroy(Achievement $achievement)
    {
        $this->authorize('delete', $achievement);

        $before = $achievement->toArray();
        $achievement->delete();
        $this->recordAudit('delete', 'achievements', $achievement->id, $before, null);

        return response()->json(['deleted' => true]);
    }
}
