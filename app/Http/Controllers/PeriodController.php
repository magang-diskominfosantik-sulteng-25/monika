<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\PeriodResource;
use App\Models\Period;
use Illuminate\Http\Request;

class PeriodController extends Controller
{
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
}
