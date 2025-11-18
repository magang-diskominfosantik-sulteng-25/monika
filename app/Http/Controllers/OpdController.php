<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\OPD\StoreOpdRequest;
use App\Http\Requests\OPD\UpdateOpdRequest;
use App\Http\Resources\OpdResource;
use App\Models\Opd;
use Illuminate\Http\Request;

class OpdController extends Controller
{
    use RecordsAudit;

    public function index(Request $req)
    {
        $q = Opd::query()
            ->when($req->has('aktif'), fn ($qq) => $qq->where('aktif', $req->boolean('aktif')))
            ->when($req->filled('search'), fn ($qq) => $qq->where('nama', 'like', '%'.$req->string('search').'%'))
            ->orderBy('nama');

        return OpdResource::collection($q->paginate($req->integer('per_page', 20)));
    }

    public function store(StoreOpdRequest $request)
    {
        $opd = Opd::create($request->validated());
        $this->recordAudit('create', 'opds', $opd->id, null, $opd->toArray());

        return (new OpdResource($opd))->response()->setStatusCode(201);
    }

    public function show(Opd $opd)
    {
        return new OpdResource($opd);
    }

    public function update(UpdateOpdRequest $request, Opd $opd)
    {
        $before = $opd->toArray();

        $opd->update($request->validated());
        $this->recordAudit('update', 'opds', $opd->id, $before, $opd->toArray());

        return new OpdResource($opd);
    }

    public function destroy(Opd $opd)
    {
        $before = $opd->toArray();
        $opd->delete();
        $this->recordAudit('delete', 'opds', $opd->id, $before, null);
        return response()->json(['deleted' => true]);
    }
}
