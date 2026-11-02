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

    public function store(Request $request, BudgetCalculationService $calculator)
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

        $subtotalCostTotal = 0;
        $contingencyTotal = 0;
        $profitTotal = 0;
        $grandTotal = 0;
        
        $processedItemsData = [];

        foreach ($validated['items'] as $item) {
            $quantity = (float) $item['quantity'];
            $workId = $item['work_id'] ?? null;
            
            $detailedCalculation = null;

            // Si el ítem está vinculado a un trabajo del catálogo, obtenemos su desglose exacto mediante el servicio
            if ($workId) {
                $work = $request->user()->works()->with('resources')->find($workId);
                if ($work) {
                    $detailedCalculation = $calculator->calculateWorkCost($work, $quantity);
                }
            }

            // Si no hay trabajo asociado o no se encontró, construimos un cálculo base
            if (!$detailedCalculation) {
                $unitPrice = (float) $item['unit_price'];
                $lineTotal = $quantity * $unitPrice;
                $detailedCalculation = [
                    'direct_costs' => $lineTotal,
                    'indirect_costs' => 0.0,
                    'subtotal_cost' => $lineTotal,
                    'contingency_amount' => 0.0,
                    'profit_amount' => 0.0,
                    'unit_price' => $unitPrice,
                    'total_price' => $lineTotal,
                    'breakdown' => [],
                ];
            }

            $subtotalCostTotal += $detailedCalculation['subtotal_cost'];
            $contingencyTotal += $detailedCalculation['contingency_amount'];
            $profitTotal += $detailedCalculation['profit_amount'];
            $grandTotal += $detailedCalculation['total_price'];

            $processedItemsData[] = [
                'work_id' => $workId,
                'work_name_snapshot' => $item['description'],
                'calculation_method_used' => $item['calculation_method'] ?? ($detailedCalculation['calculation_method'] ?? 'simple'),
                'details_snapshot' => json_encode($detailedCalculation),
                'description' => $item['description'],
                'quantity' => $quantity,
                'unit' => $item['unit'] ?? 'u.',
                'unit_price' => $detailedCalculation['unit_price'],
                'subtotal_price' => $detailedCalculation['subtotal_cost'],
                'total_price' => $detailedCalculation['total_price'],
            ];
        }

        // Creamos el presupuesto consolidado con totales reales calculados
        $budget = $request->user()->budgets()->create([
            'uuid' => (string) Str::uuid(),
            'budget_number' => 'PRES-' . strtoupper(Str::random(8)),
            'client_name' => $validated['client_name'],
            'client_phone' => $validated['client_phone'] ?? null,
            'client_address' => $validated['client_address'] ?? null,
            'currency' => $validated['currency'],
            'subtotal_cost' => round($subtotalCostTotal, 2),
            'contingency_amount' => round($contingencyTotal, 2),
            'profit_amount' => round($profitTotal, 2),
            'total_price' => round($grandTotal, 2),
            'status' => 'draft',
            'execution_conditions' => $validated['execution_conditions'] ?? null,
            'issued_at' => now(),
        ]);

        // Insertamos los ítems con su snapshot detallado
        foreach ($processedItemsData as $itemData) {
            $budget->items()->create($itemData);
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