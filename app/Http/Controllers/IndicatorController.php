<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Resources\IndicatorResource;
use App\Models\IndicatorMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class IndicatorController extends Controller
{
    use RecordsAudit;
    public function index(Request $request)
    {
        $query = IndicatorMaster::query()
            ->with('opd:id,nama')
            ->when($request->filled('jenis'), function ($q) use ($request) {
                $jenis = Arr::wrap($request->input('jenis'));
                $jenis = array_map(fn ($value) => strtoupper((string) $value), $jenis);
                return $q->whereIn('jenis', $jenis);
            })
            ->when($request->filled('frequency'), fn ($q) => $q->where('frequency', $request->string('frequency')))
            ->when($request->has('aktif'), fn ($q) => $q->where('aktif', $request->boolean('aktif')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = '%'.$request->string('search').'%';
                return $q->where(function ($qq) use ($search) {
                    $qq->where('nama', 'like', $search)
                        ->orWhere('kode', 'like', $search);
                });
            })
            ->orderBy('nama');

        return IndicatorResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function show(IndicatorMaster $indicator)
    {
        return new IndicatorResource($indicator);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:500'],
            'jenis' => ['required', 'in:IKU,IKD,IKK'],
            'indicator_type' => ['required', 'in:numeric,percent,index,text'],
            'satuan' => ['required', 'string', 'max:100'],
            'opd_id' => ['required', 'integer', 'exists:opds,id'],
            'frequency' => ['required', 'in:annual,semester,quarter,month'],
            'keterangan' => ['nullable', 'string'],
            'version' => ['nullable', 'integer'],
            'aktif' => ['boolean'],
        ]);

        $indicator = IndicatorMaster::create([
            ...$validated,
            'aktif' => $validated['aktif'] ?? true,
        ]);

        $this->recordAudit('create', 'indicator_masters', $indicator->id, null, $indicator->toArray());

        return (new IndicatorResource($indicator))->response()->setStatusCode(201);
    }

    public function update(Request $request, IndicatorMaster $indicator)
    {
        $validated = $request->validate([
            'nama' => ['sometimes', 'required', 'string', 'max:500'],
            'jenis' => ['sometimes', 'required', 'in:IKU,IKD,IKK'],
            'indicator_type' => ['sometimes', 'required', 'in:numeric,percent,index,text'],
            'satuan' => ['sometimes', 'required', 'string', 'max:100'],
            'opd_id' => ['required', 'integer', 'exists:opds,id'],
            'frequency' => ['sometimes', 'required', 'in:annual,semester,quarter,month'],
            'keterangan' => ['nullable', 'string'],
            'version' => ['nullable', 'integer'],
            'aktif' => ['boolean'],
        ]);

        $before = $indicator->toArray();
        $indicator->update($validated);
        $this->recordAudit('update', 'indicator_masters', $indicator->id, $before, $indicator->toArray());

        return new IndicatorResource($indicator);
    }

    public function destroy(IndicatorMaster $indicator)
    {
        $before = $indicator->toArray();
        $indicator->delete();
        $this->recordAudit('delete', 'indicator_masters', $indicator->id, $before, null);

        return response()->json(['deleted' => true]);
    }
}
