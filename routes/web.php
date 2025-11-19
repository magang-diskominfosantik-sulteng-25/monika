<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// OPD
Route::get('/opd', function () {
    return Inertia::render('OPD');
})->name('opd');

// Indikator
Route::get('/indikator', function () {
    return Inertia::render('Indikator');
})->name('indikator');

// Period
Route::get('/period', function () {
    return Inertia::render('Period');
})->name('period');

// Target
Route::get('/target', function () {
    return Inertia::render('Target');
})->name('target');

// Capaian
Route::get('/capaian', function () {
    return Inertia::render('Capaian');
})->name('capaian');

// Laporan
Route::get('/laporan', function () {
    return Inertia::render('Laporan');
})->name('laporan');

// Audit Log
Route::get('/audit-log', function () {
    return Inertia::render('AuditLog');
})->name('audit-log');
