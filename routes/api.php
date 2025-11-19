<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
    ->middleware(['web', 'auth'])
    ->group(function (): void {
        require __DIR__.'/api.v1.php';
    });
