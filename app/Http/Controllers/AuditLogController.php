<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query()
            ->with('user')
            ->when($request->filled('entity'), fn ($q) => $q->where('entity', $request->string('entity')))
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->orderByDesc('created_at');

        return AuditLogResource::collection($query->paginate($request->integer('per_page', 20)));
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');

        return new AuditLogResource($auditLog);
    }
}
