<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\WorkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PublicBudgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    Route::get('/budgets/{budget}/pdf', [BudgetController::class, 'downloadPdf'])->name('budgets.pdf');
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/p/presupuesto/{uuid}', [PublicBudgetController::class, 'show'])->name('public.budgets.show');
    Route::post('/p/presupuesto/{uuid}/status', [PublicBudgetController::class, 'updateStatus'])->name('public.budgets.status');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/business', [ProfileController::class, 'updateBusiness'])->name('profile.business.update');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    
    // Módulos principales OficioApp
    Route::resource('works', WorkController::class);
    Route::resource('resources', ResourceController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('budgets', BudgetController::class);
    
});

require __DIR__.'/auth.php';