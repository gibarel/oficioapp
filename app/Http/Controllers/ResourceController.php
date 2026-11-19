<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResourceController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $resources = Resource::where('user_id', $userId)
            ->orWhereNull('user_id')
            ->with('aliases')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        return Inertia::render('Resources/Index', [
            'resources' => $resources,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:material,labor,asset,service,extra',
            'name' => 'required|string|max:255',
            'use_unit' => 'required|string|max:50',
            'unit_value' => 'required|numeric|min:0',
            'purchase_unit' => 'nullable|string|max:50',
            'conversion_factor' => 'nullable|numeric|min:0.0001',
            'acquisition_cost' => 'nullable|numeric|min:0',
            'useful_life_months' => 'nullable|integer|min:1',
            'estimated_monthly_use_hours' => 'nullable|integer|min:1',
        ]);

        $resource = new Resource($validated);
        $resource->user_id = $request->user()->id;

        if ($resource->type === 'asset') {
            $resource->hourly_depreciation_rate = $resource->calculateDepreciationRate();
        }

        $resource->save();

        return redirect()->route('resources.index')->with('success', 'Insumo registrado correctamente.');
    }

    public function update(Request $request, Resource $resource)
    {
        $validated = $request->validate([
            'type' => 'required|in:material,labor,asset,service,extra',
            'name' => 'required|string|max:255',
            'use_unit' => 'required|string|max:50',
            'unit_value' => 'required|numeric|min:0',
            'purchase_unit' => 'nullable|string|max:50',
            'conversion_factor' => 'nullable|numeric|min:0.0001',
            'acquisition_cost' => 'nullable|numeric|min:0',
            'useful_life_months' => 'nullable|integer|min:1',
            'estimated_monthly_use_hours' => 'nullable|integer|min:1',
        ]);

        $userId = $request->user()->id;

        // Si el recurso es global (user_id es null), al editarlo creamos una copia personal para el usuario
        if ($resource->user_id === null) {
            $newResource = new Resource($validated);
            $newResource->user_id = $userId;

            if ($newResource->type === 'asset') {
                $newResource->hourly_depreciation_rate = $newResource->calculateDepreciationRate();
            }
            
            $newResource->save();
        } else {
            // Si ya es un recurso propio del usuario, simplemente lo actualizamos
            $resource->fill($validated);
            $resource->user_id = $userId; // Asegurar propiedad

            if ($resource->type === 'asset') {
                $resource->hourly_depreciation_rate = $resource->calculateDepreciationRate();
            }

            $resource->save();
        }

        return redirect()->route('resources.index')->with('success', 'Insumo actualizado correctamente (guardado como personal).');
    }
}