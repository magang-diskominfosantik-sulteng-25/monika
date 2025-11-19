<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware(['web']) // TODO: Tambahkan 'auth' setelah sistem login dibuat
    ->group(function (): void {
        require __DIR__.'/api.v1.php';
    });
