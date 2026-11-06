<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\WorkController;
use App\Http\Controllers\PublicBudgetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Ruta de bienvenida pública
Route::get('/', function () {
    return Inertia::render('Welcome');
});

// Ruta pública para clientes (visualizar presupuesto online sin estar logueado)
Route::get('/p/presupuesto/{uuid}', [PublicBudgetController::class, 'show'])->name('public.budgets.show');
Route::post('/p/presupuesto/{uuid}/status', [PublicBudgetController::class, 'updateStatus'])->name('public.budgets.status');

// Rutas protegidas para usuarios autenticados (Contratistas)
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard principal
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Perfil de negocio y empresa
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/business', [ProfileController::class, 'updateBusiness'])->name('profile.business.update');

    // Transacciones y Finanzas
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Módulos Principales (Trabajos, Insumos/Recursos con edición y Presupuestos)
    Route::resource('works', WorkController::class);
    Route::resource('resources', ResourceController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('budgets', BudgetController::class);
    
    // PDF de Presupuestos
    Route::get('/budgets/{budget}/pdf', [BudgetController::class, 'downloadPdf'])->name('budgets.pdf');
});

require __DIR__.'/auth.php';