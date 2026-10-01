<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Work;
use App\Services\BudgetCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $budgets = $request->user()->budgets()
            ->withCount('items')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
        ]);
    }

    public function create(Request $request): Response
    {
        $works = $request->user()->works()->with('resources')->get();

        return Inertia::render('Budgets/Create', [
            'availableWorks' => $works,
        ]);
    }

    public function store(Request $request, BudgetCalculationService $calculator)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_phone' => 'nullable|string|max:50',
            'client_address' => 'nullable|string|max:255',
            'currency' => 'required|string|size:3',
            'execution_conditions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.work_id' => 'required|exists:works,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        // Mapear trabajos y calcular
        $itemsCollection = collect($validated['items'])->map(function ($item) {
            return [
                'work' => Work::with('resources')->findOrFail($item['work_id']),
                'quantity' => (float) $item['quantity'],
            ];
        });

        $totals = $calculator->calculateBudgetTotals($itemsCollection);

        $budget = $request->user()->budgets()->create([
            'budget_number' => 'PRES-' . strtoupper(uniqid()),
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'] ?? null,
            'client_address' => $validated['client_address'] ?? null,
            'currency' => $validated['currency'],
            'subtotal_cost' => $totals['subtotal_cost'],
            'contingency_amount' => $totals['contingency_amount'],
            'profit_amount' => $totals['profit_amount'],
            'total_price' => $totals['total_price'],
            'status' => 'draft',
            'execution_conditions' => $validated['execution_conditions'] ?? null,
            'issued_at' => now(),
        ]);

        // Guardar snapshot inmutable de los ítems
        foreach ($totals['items'] as $calculatedItem) {
            $budget->items()->create([
                'work_name_snapshot' => $calculatedItem['work_name'],
                'calculation_method_used' => $calculatedItem['calculation_method'],
                'quantity' => $calculatedItem['quantity'],
                'unit_price' => $calculatedItem['unit_price'],
                'subtotal_price' => $calculatedItem['total_price'],
                'details_snapshot' => $calculatedItem,
            ]);
        }

        return redirect()->route('budgets.show', $budget->id)->with('success', 'Presupuesto generado.');
    }

    public function show(Budget $budget): Response
    {
        $budget->load('items');

        return Inertia::render('Budgets/Show', [
            'budget' => $budget,
        ]);
    }

    public function downloadPdf(Budget $budget)
    {
        $budget->load('items');

        $pdf = Pdf::loadView('pdf.budget', compact('budget'));

        return $pdf->download("Presupuesto-{$budget->budget_number}.pdf");
    }
}