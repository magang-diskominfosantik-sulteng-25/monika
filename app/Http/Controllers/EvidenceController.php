<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RecordsAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Evidence\StoreEvidenceRequest;
use App\Http\Resources\EvidenceResource;
use App\Models\Achievement;
use App\Models\Evidence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
class EvidenceController extends Controller
{
    use RecordsAudit, AuthorizesRequests;

    public function index(Request $request, Achievement $achievement)
    {
        $query = $achievement->evidences()->latest();

        return EvidenceResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function store(StoreEvidenceRequest $request, Achievement $achievement)
    {
        if ($achievement->isLocked()) {
            abort(422, __('Realisasi terkunci dan tidak dapat ditambah evidensi.'));
        }

        if ($achievement->evidences()->count() >= 5) {
            abort(422, __('Maksimal 5 dokumen evidensi per realisasi.'));
        }

        $validated = $request->validated();
        $filePath = null;
        $fileHash = null;
        $fileSize = null;

        if ($request->hasFile('file')) {
            $stored = $request->file('file');
            $filePath = $stored->store('', 'evidences');
            $fileSize = $stored->getSize();
            $fileHash = hash_file('sha256', $stored->getRealPath());
        }

        $evidence = $achievement->evidences()->create([
            'file_path'     => $filePath,
            'file_hash'     => $fileHash,
            'file_size'     => $fileSize,
            'url_eksternal' => $validated['url_eksternal'] ?? null,
            'deskripsi'     => $validated['deskripsi'] ?? null,
            'uploaded_by'   => Auth::id(),
        ]);

        $this->recordAudit('create', 'evidences', $evidence->id, null, $evidence->toArray());

        return (new EvidenceResource($evidence))->response()->setStatusCode(201);
    }

    public function destroy(Evidence $evidence)
    {
        $this->authorize('delete', $evidence);

        $before = $evidence->toArray();

        if ($evidence->file_path) {
            Storage::disk('evidences')->delete($evidence->file_path);
        }

        $evidence->delete();
        $this->recordAudit('delete', 'evidences', $evidence->id, $before, null);

        return response()->json(['deleted' => true]);
    }

    public function download(Evidence $evidence): StreamedResponse
    {
        if (! $evidence->file_path) {
            abort(404);
        }

        return Storage::disk('evidences')->download($evidence->file_path);
    }
}
