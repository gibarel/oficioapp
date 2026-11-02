<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Work;
use App\Services\BudgetCalculationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        $budgets = $request->user()
            ->budgets()
            ->latest()
            ->get();

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
        ]);
    }

    public function create(BudgetCalculationService $calculator): Response
    {
        // Cargamos los trabajos con sus recursos asociados e inyectamos el precio unitario calculado por el servicio
        $works = auth()->user()->works()->with('resources')->orderBy('name')->get()->map(function ($work) use ($calculator) {
            $calculation = $calculator->calculateWorkCost($work);
            
            // Asignamos dinámicamente el precio unitario sugerido (ya sea simple, intermedio o avanzado)
            $work->unit_price = $calculation['unit_price'];
            return $work;
        });

        return Inertia::render('Budgets/Create', [
            'works' => $works,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'client_phone' => 'nullable|string|max:50',
            'client_address' => 'nullable|string|max:255',
            'currency' => 'required|string|max:10',
            'execution_conditions' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.work_id' => 'nullable|exists:works,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.calculation_method' => 'nullable|string|in:simple,intermediate,advanced',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit' => 'nullable|string|max:20',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += $item['quantity'] * $item['unit_price'];
        }

        $budget = $request->user()->budgets()->create([
            'uuid' => (string) Str::uuid(),
            'budget_number' => 'PRES-' . strtoupper(Str::random(8)),
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'] ?? null,
            'client_address' => $validated['client_address'] ?? null,
            'currency' => $validated['currency'],
            'subtotal_cost' => $subtotal,
            'contingency_amount' => 0,
            'profit_amount' => 0,
            'total_price' => $subtotal,
            'status' => 'draft',
            'execution_conditions' => $validated['execution_conditions'] ?? null,
            'issued_at' => now(),
        ]);

        foreach ($validated['items'] as $item) {
            $itemTotal = $item['quantity'] * $item['unit_price'];

            $budget->items()->create([
                'work_id' => $item['work_id'] ?? null,
                'work_name_snapshot' => $item['description'],
                'calculation_method_used' => $item['calculation_method'] ?? 'simple',
                'details_snapshot' => json_encode([
                    'description' => $item['description'],
                    'unit' => $item['unit'] ?? 'u.',
                    'unit_price' => $item['unit_price'],
                ]),
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit' => $item['unit'] ?? 'u.',
                'unit_price' => $item['unit_price'],
                'subtotal_price' => $itemTotal,
                'total_price' => $itemTotal,
            ]);
        }

        return redirect()->route('budgets.show', $budget->id)->with('success', 'Presupuesto generado correctamente.');
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