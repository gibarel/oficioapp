<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        // Métricas clave
        $totalIssued = $user->budgets()->count();
        $totalApproved = $user->budgets()->where('status', 'accepted')->count();
        $totalDrafts = $user->budgets()->where('status', 'draft')->count();

        // Monto total presupuestado acumulado
        $totalAmountSum = $user->budgets()->sum('total_price');

        // Presupuestos recientes (últimos 5)
        $recentBudgets = $user->budgets()
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'budget_number', 'client_name', 'total_price', 'status', 'issued_at', 'currency']);

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalIssued' => $totalIssued,
                'totalApproved' => $totalApproved,
                'totalDrafts' => $totalDrafts,
                'totalAmountSum' => number_format($totalAmountSum, 2, '.', ''),
            ],
            'recentBudgets' => $recentBudgets,
        ]);
    }
}