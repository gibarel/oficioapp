<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Expense;
use App\Models\Income;
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
        $activeClientsCount = Client::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();

        // Monto total presupuestado acumulado
        $totalAmountSum = $user->budgets()->sum('total_price');

        // Ganancia estimada en presupuestos aprobados
        $approvedProfitSum = $user->budgets()
            ->where('status', 'accepted')
            ->sum('profit_amount');

        // Cobros y gastos registrados por el usuario
        $totalIncomesSum = Income::where('user_id', $user->id)->sum('amount');
        $totalExpensesSum = Expense::where('user_id', $user->id)->sum('amount');

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
                'totalAmountSum' => number_format((float) $totalAmountSum, 2, '.', ''),
                'activeClientsCount' => $activeClientsCount,
                'approvedProfitSum' => number_format((float) $approvedProfitSum, 2, '.', ''),
                'totalIncomesSum' => number_format((float) $totalIncomesSum, 2, '.', ''),
                'totalExpensesSum' => number_format((float) $totalExpensesSum, 2, '.', ''),
            ],
            'recentBudgets' => $recentBudgets,
        ]);
    }
}