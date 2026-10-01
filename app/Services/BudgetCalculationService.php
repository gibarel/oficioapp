<?php

namespace App\Services;

use App\Models\Work;
use Illuminate\Support\Collection;

class BudgetCalculationService
{
    /**
     * Calcula el desglose económico completo de un trabajo específico (Work).
     */
    public function calculateWorkCost(Work $work, float $quantity = 1.0): array
    {
        // Cargar los recursos asociados si no están cargados
        if (!$work->relationLoaded('resources')) {
            $work->load('resources');
        }

        $directCosts = 0.0;
        $indirectCosts = 0.0;
        $breakdown = [];

        foreach ($work->resources as $resource) {
            $pivot = $resource->pivot;

            // Si el insumo lo provee el cliente, no suma costo al presupuesto
            if ($pivot->is_client_provided) {
                $breakdown[] = [
                    'resource_id' => $resource->id,
                    'name' => $resource->name,
                    'type' => $resource->type,
                    'cost' => 0.0,
                    'note' => 'Provisto por el cliente',
                ];
                continue;
            }

            // Usar el valor personalizado del pivot o el valor base del recurso
            $unitValue = $pivot->custom_unit_value ?? $resource->unit_value;

            // Si es un activo/herramienta con tasa de depreciación por hora
            if ($resource->type === 'asset' && $resource->hourly_depreciation_rate > 0) {
                $unitValue = $resource->hourly_depreciation_rate;
            }

            $resourceCost = 0.0;

            // Cálculo según tipo de asignación (allocation_type)
            switch ($pivot->allocation_type) {
                case 'hourly_rate':
                case 'direct':
                default:
                    $resourceCost = $pivot->quantity * $unitValue;
                    $directCosts += $resourceCost;
                    break;

                case 'percentage_share':
                    // Imputación indirecta por porcentaje
                    $resourceCost = ($pivot->allocation_value / 100) * $unitValue;
                    $indirectCosts += $resourceCost;
                    break;

                case 'fixed_estimate':
                    // Monto fijo global atribuido
                    $resourceCost = (float) $pivot->allocation_value;
                    $indirectCosts += $resourceCost;
                    break;
            }

            $breakdown[] = [
                'resource_id' => $resource->id,
                'name' => $resource->name,
                'type' => $resource->type,
                'quantity' => $pivot->quantity,
                'unit_value' => $unitValue,
                'cost' => round($resourceCost, 2),
            ];
        }

        // Si el método es 'simple' y no hay recursos cargados, usar base_price
        if ($work->calculation_method === 'simple' && empty($breakdown) && $work->base_price) {
            $directCosts = $work->base_price;
        }

        $unitSubtotal = $directCosts + $indirectCosts;

        // Imprevistos / Contingencia
        $contingencyAmount = $unitSubtotal * ($work->contingency_percentage / 100);
        $costWithContingency = $unitSubtotal + $contingencyAmount;

        // Margen de ganancia
        $profitAmount = $costWithContingency * ($work->profit_margin_percentage / 100);

        // Precio unitario final y total para la cantidad especificada
        $unitPrice = round($costWithContingency + $profitAmount, 2);
        $totalPrice = round($unitPrice * $quantity, 2);

        return [
            'work_id' => $work->id,
            'work_name' => $work->name,
            'calculation_method' => $work->calculation_method,
            'quantity' => $quantity,
            'direct_costs' => round($directCosts, 2),
            'indirect_costs' => round($indirectCosts, 2),
            'subtotal_cost' => round($unitSubtotal, 2),
            'contingency_amount' => round($contingencyAmount, 2),
            'profit_amount' => round($profitAmount, 2),
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Calcula los totales consolidados para un Presupuesto con múltiples ítems.
     *
     * @param Collection<Work> $worksWithQuantities Array/Collection con pares ['work' => Work, 'quantity' => float]
     */
    public function calculateBudgetTotals(Collection $items): array
    {
        $subtotalCost = 0.0;
        $contingencyTotal = 0.0;
        $profitTotal = 0.0;
        $grandTotal = 0.0;
        $processedItems = [];

        foreach ($items as $item) {
            /** @var Work $work */
            $work = $item['work'];
            $quantity = $item['quantity'] ?? 1.0;

            $calculated = $this->calculateWorkCost($work, $quantity);

            $subtotalCost += $calculated['subtotal_cost'] * $quantity;
            $contingencyTotal += $calculated['contingency_amount'] * $quantity;
            $profitTotal += $calculated['profit_amount'] * $quantity;
            $grandTotal += $calculated['total_price'];

            $processedItems[] = $calculated;
        }

        return [
            'subtotal_cost' => round($subtotalCost, 2),
            'contingency_amount' => round($contingencyTotal, 2),
            'profit_amount' => round($profitTotal, 2),
            'total_price' => round($grandTotal, 2),
            'items' => $processedItems,
        ];
    }
}