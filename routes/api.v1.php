<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\EvidenceController;
use App\Http\Controllers\IndicatorController;
use App\Http\Controllers\OpdController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TargetController;
use Illuminate\Support\Facades\Route;

// OPD
Route::apiResource('opds', OpdController::class);

// Indicators (full CRUD)
Route::apiResource('indicators', IndicatorController::class);

// Periods (full CRUD)
Route::apiResource('periods', PeriodController::class);

// Targets
Route::apiResource('targets', TargetController::class);
Route::post('targets/bulk', [TargetController::class, 'bulk'])->name('targets.bulk');

// Achievements
Route::apiResource('achievements', AchievementController::class);

// Evidences
Route::get('achievements/{achievement}/evidences', [EvidenceController::class, 'index']);
Route::post('achievements/{achievement}/evidences', [EvidenceController::class, 'store']);
Route::delete('evidences/{evidence}', [EvidenceController::class, 'destroy']);
Route::get('evidences/{evidence}/download', [EvidenceController::class, 'download'])->name('evidences.download');

// Audit logs
Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);

// Reports
Route::get('reports/options', [ReportController::class, 'options']);
Route::get('reports/summary', [ReportController::class, 'summary']);
Route::get('reports/matrix', [ReportController::class, 'matrix']);
Route::get('reports/evidences', [ReportController::class, 'evidences']);
Route::get('reports/export', [ReportController::class, 'export']);
