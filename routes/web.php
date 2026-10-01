<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/budgets/{budget}/pdf', [BudgetController::class, 'downloadPdf'])->name('budgets.pdf');

    // Módulos principales OficioApp
    Route::resource('works', WorkController::class);
    Route::resource('resources', ResourceController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('budgets', BudgetController::class);
    
});

require __DIR__.'/auth.php';