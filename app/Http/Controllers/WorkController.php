<?php

namespace App\Http\Controllers;

use App\Models\Work;
use App\Models\Resource;
use App\Services\BudgetCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WorkController extends Controller
{
    public function index(Request $request): Response
    {
        $works = $request->user()
            ->works()
            ->with('resources')
            ->latest()
            ->get();

        return Inertia::render('Works/Index', [
            'works' => $works,
        ]);
    }

    public function create(): Response
    {
        // Usamos Resource::query() para evitar que la restricción de la relación del usuario oculte los recursos globales (user_id IS NULL)
        $resources = Resource::orderBy('name')->get();

        return Inertia::render('Works/Create', [
            'resources' => $resources,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'calculation_method' => 'required|in:simple,intermediate,advanced',
            'reference_unit' => 'nullable|string|max:50',
            'base_price' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0|max:100',
            'profit_margin_percentage' => 'nullable|numeric|min:0|max:1000',
            'notes' => 'nullable|string',
            'is_template' => 'boolean',
            'resources' => 'array',
            'resources.*.id' => 'exists:resources,id',
            'resources.*.quantity' => 'required|numeric|min:0.01',
            'resources.*.unit' => 'required|string|max:50', // 👈 Validación de la unidad dinámica
            'resources.*.custom_unit_value' => 'nullable|numeric|min:0',
            'resources.*.allocation_type' => 'required|in:direct,hourly_rate,percentage_share,fixed_estimate',
            'resources.*.allocation_value' => 'nullable|numeric|min:0',
            'resources.*.is_client_provided' => 'boolean',
        ]);

        $work = $request->user()->works()->create([
            'name' => $validated['name'],
            'calculation_method' => $validated['calculation_method'],
            'reference_unit' => $validated['reference_unit'] ?? null,
            'base_price' => $validated['base_price'] ?? 0,
            'contingency_percentage' => $validated['contingency_percentage'] ?? 0,
            'profit_margin_percentage' => $validated['profit_margin_percentage'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'is_template' => $validated['is_template'] ?? false,
        ]);

        if (!empty($validated['resources'])) {
            $pivotData = [];
            foreach ($validated['resources'] as $res) {
                $pivotData[$res['id']] = [
                    'quantity' => $res['quantity'],
                    'unit' => $res['unit'] ?? 'u', // 👈 Guardamos la unidad elegida en la tabla pivote
                    'custom_unit_value' => $res['custom_unit_value'] ?? null,
                    'allocation_type' => $res['allocation_type'] ?? 'direct',
                    'allocation_value' => $res['allocation_value'] ?? null,
                    'is_client_provided' => $res['is_client_provided'] ?? false,
                ];
            }
            // Usamos sync en lugar de attach para guardar el array completo limpiamente
            $work->resources()->sync($pivotData);
        }

        return redirect()->route('works.index')->with('success', 'Trabajo guardado correctamente.');
    }

    public function show(Work $work, BudgetCalculationService $calculator): Response
    {
        Gate::authorize('view', $work);

        $work->load('resources');
        $calculation = $calculator->calculateWorkCost($work);

        return Inertia::render('Works/Show', [
            'work' => $work,
            'calculation' => $calculation,
        ]);
    }

    public function edit(Work $work): Response
    {
        Gate::authorize('update', $work);

        $work->load('resources');
        
        // Cargamos todos los recursos disponibles (personales + globales)
        $availableResources = Resource::orderBy('name')->get();

        return Inertia::render('Works/Edit', [
            'work' => $work,
            'availableResources' => $availableResources,
        ]);
    }

    public function update(Request $request, Work $work)
    {
        Gate::authorize('update', $work);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'calculation_method' => 'required|in:simple,intermediate,advanced',
            'reference_unit' => 'nullable|string|max:50',
            'base_price' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0|max:100',
            'profit_margin_percentage' => 'nullable|numeric|min:0|max:1000',
            'notes' => 'nullable|string',
            'is_template' => 'boolean',
            'resources' => 'array',
            'resources.*.id' => 'exists:resources,id',
            'resources.*.quantity' => 'required|numeric|min:0.01',
            'resources.*.unit' => 'required|string|max:50', // 👈 Validación de la unidad dinámica en actualización
            'resources.*.custom_unit_value' => 'nullable|numeric|min:0',
            'resources.*.allocation_type' => 'required|in:direct,hourly_rate,percentage_share,fixed_estimate',
            'resources.*.allocation_value' => 'nullable|numeric|min:0',
            'resources.*.is_client_provided' => 'boolean',
        ]);

        $work->update([
            'name' => $validated['name'],
            'calculation_method' => $validated['calculation_method'],
            'reference_unit' => $validated['reference_unit'] ?? null,
            'base_price' => $validated['base_price'] ?? 0,
            'contingency_percentage' => $validated['contingency_percentage'] ?? 0,
            'profit_margin_percentage' => $validated['profit_margin_percentage'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'is_template' => $validated['is_template'] ?? false,
        ]);

        $pivotData = [];
        if (!empty($validated['resources'])) {
            foreach ($validated['resources'] as $res) {
                $pivotData[$res['id']] = [
                    'quantity' => $res['quantity'],
                    'unit' => $res['unit'] ?? 'u', // 👈 Sincronizamos la unidad elegida
                    'custom_unit_value' => $res['custom_unit_value'] ?? null,
                    'allocation_type' => $res['allocation_type'] ?? 'direct',
                    'allocation_value' => $res['allocation_value'] ?? null,
                    'is_client_provided' => $res['is_client_provided'] ?? false,
                ];
            }
        }
        $work->resources()->sync($pivotData);

        return redirect()->route('works.index')->with('success', 'Trabajo actualizado correctamente.');
    }

    public function destroy(Work $work)
    {
        Gate::authorize('delete', $work);

        $work->delete();

        return redirect()->route('works.index')->with('success', 'Trabajo eliminado correctamente.');
    }
}