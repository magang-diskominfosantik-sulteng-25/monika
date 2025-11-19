<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

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

    // Users
    Route::get('/users', [UserController::class, 'index'])->name('users');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});
