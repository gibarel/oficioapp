<?php

namespace App\Http\Controllers;

use App\Models\Work;
use App\Models\Resource;
use App\Services\BudgetCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkController extends Controller
{
    public function index(Request $request): Response
    {
        $works = $request->user()->works()
            ->with('resources')
            ->orderBy('name')
            ->get();

        return Inertia::render('Works/Index', [
            'works' => $works,
        ]);
    }

    public function create(Request $request): Response
    {
        $resources = $request->user()->resources()->get();

        return Inertia::render('Works/Create', [
            'availableResources' => $resources,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'calculation_method' => 'required|in:simple,intermediate,advanced',
            'reference_unit' => 'required|string|max:50',
            'base_price' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0|max:100',
            'profit_margin_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
            'resources' => 'array',
            'resources.*.id' => 'required|exists:resources,id',
            'resources.*.quantity' => 'required|numeric|min:0',
            'resources.*.custom_unit_value' => 'nullable|numeric|min:0',
            'resources.*.allocation_type' => 'required|in:direct,hourly_rate,percentage_share,fixed_estimate',
            'resources.*.allocation_value' => 'nullable|numeric|min:0',
            'resources.*.is_client_provided' => 'boolean',
        ]);

        $work = $request->user()->works()->create($validated);

        if (!empty($validated['resources'])) {
            $syncData = [];
            foreach ($validated['resources'] as $res) {
                $syncData[$res['id']] = [
                    'quantity' => $res['quantity'],
                    'custom_unit_value' => $res['custom_unit_value'] ?? null,
                    'allocation_type' => $res['allocation_type'] ?? 'direct',
                    'allocation_value' => $res['allocation_value'] ?? null,
                    'is_client_provided' => $res['is_client_provided'] ?? false,
                ];
            }
            $work->resources()->sync($syncData);
        }

        return redirect()->route('works.index')->with('success', 'Trabajo guardado correctamente.');
    }

    public function show(Work $work, BudgetCalculationService $calculator): Response
    {
        $this->authorize('view', $work);

        $work->load('resources');
        $calculation = $calculator->calculateWorkCost($work);

        return Inertia::render('Works/Show', [
            'work' => $work,
            'calculation' => $calculation,
        ]);
    }
}