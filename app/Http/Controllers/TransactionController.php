<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = $user->transactions()
            ->with('budget:id,budget_number,client_name')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $totalIncome = $user->transactions()->where('type', 'income')->sum('amount');
        $totalExpense = $user->transactions()->where('type', 'expense')->sum('amount');
        $netProfit = $totalIncome - $totalExpense;

        $budgets = $user->budgets()->select('id', 'budget_number', 'client_name')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'budgets' => $budgets,
            'summary' => [
                'totalIncome' => number_format($totalIncome, 2, '.', ''),
                'totalExpense' => number_format($totalExpense, 2, '.', ''),
                'netProfit' => number_format($netProfit, 2, '.', ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'budget_id' => 'nullable|exists:budgets,id',
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
        ]);

        $request->user()->transactions()->create($validated);

        return back()->with('success', 'Movimiento registrado correctamente.');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();

        return back()->with('success', 'Movimiento eliminado.');
    }
}