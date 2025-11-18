<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\IndicatorResource;
use App\Models\IndicatorMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class IndicatorController extends Controller
{
    public function index(Request $request)
    {
        $query = IndicatorMaster::query()
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
}
