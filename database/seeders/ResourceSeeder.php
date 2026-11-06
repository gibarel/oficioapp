<?php

namespace Database\Seeders;

use App\Models\Resource;
use Illuminate\Database\Seeder;

class ResourceSeeder extends Seeder
{
    public function run(): void
    {
        $presetResources = [
            // 🧱 Materiales (Bioconstrucción + Tradicional)
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Tierra / Arcilla cribada',
                'use_unit' => 'm3',
                'unit_value' => 0.00,
                'purchase_unit' => 'm3',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Paja en rollo',
                'use_unit' => 'unidad',
                'unit_value' => 0.00,
                'purchase_unit' => 'rollo',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Arena en bolsón',
                'use_unit' => 'm3',
                'unit_value' => 0.00,
                'purchase_unit' => 'bolsón',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Cemento Portland (50kg)',
                'use_unit' => 'bolsa',
                'unit_value' => 0.00,
                'purchase_unit' => 'bolsa',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Cal aérea / hidráulica (25kg)',
                'use_unit' => 'bolsa',
                'unit_value' => 0.00,
                'purchase_unit' => 'bolsa',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Ladrillo cerámico hueco 12x18x33',
                'use_unit' => 'unidad',
                'unit_value' => 0.00,
                'purchase_unit' => 'millar',
                'conversion_factor' => 0.0010, // 1 unidad = 0.001 millar para estandarizar si se compra por millar
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Ladrillo común de obra',
                'use_unit' => 'unidad',
                'unit_value' => 0.00,
                'purchase_unit' => 'millar',
                'conversion_factor' => 0.0010,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Hierro del 8 (Barra 12m)',
                'use_unit' => 'barra',
                'unit_value' => 0.00,
                'purchase_unit' => 'barra',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Hierro del 10 (Barra 12m)',
                'use_unit' => 'barra',
                'unit_value' => 0.00,
                'purchase_unit' => 'barra',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'material',
                'name' => 'Piedra partida granítica',
                'use_unit' => 'm3',
                'unit_value' => 0.00,
                'purchase_unit' => 'm3',
                'conversion_factor' => 1.0000,
            ],

            // 🛠️ Herramientas / Equipamiento (Assets)
            [
                'user_id' => null,
                'type' => 'asset',
                'name' => 'Hormigonera / Trompito (130L)',
                'use_unit' => 'día',
                'unit_value' => 0.00,
                'purchase_unit' => 'día',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'asset',
                'name' => 'Andamio tubular (Cuerpo completo)',
                'use_unit' => 'día',
                'unit_value' => 0.00,
                'purchase_unit' => 'día',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'asset',
                'name' => 'Carretilla reforzada y baldes',
                'use_unit' => 'día',
                'unit_value' => 0.00,
                'purchase_unit' => 'unidad',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'asset',
                'name' => 'Compactador mecánico / Pata de cabra',
                'use_unit' => 'día',
                'unit_value' => 0.00,
                'purchase_unit' => 'día',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'asset',
                'name' => 'Amoladora angular / Taladro percutor',
                'use_unit' => 'día',
                'unit_value' => 0.00,
                'purchase_unit' => 'día',
                'conversion_factor' => 1.0000,
            ],

            // 👷 Mano de Obra (Labor)
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'Jornal Oficial Albañil',
                'use_unit' => 'jornal',
                'unit_value' => 0.00,
                'purchase_unit' => 'jornal',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'Jornal Medio Oficial',
                'use_unit' => 'jornal',
                'unit_value' => 0.00,
                'purchase_unit' => 'jornal',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'Jornal Ayudante / Peón',
                'use_unit' => 'jornal',
                'unit_value' => 0.00,
                'purchase_unit' => 'jornal',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'Jornal Oficial Bioconstructor',
                'use_unit' => 'jornal',
                'unit_value' => 0.00,
                'purchase_unit' => 'jornal',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'm² Mampostería (Ladrillo común/hueco)',
                'use_unit' => 'm2',
                'unit_value' => 0.00,
                'purchase_unit' => 'm2',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'm² Contrapiso y Carpeta',
                'use_unit' => 'm2',
                'unit_value' => 0.00,
                'purchase_unit' => 'm2',
                'conversion_factor' => 1.0000,
            ],
            [
                'user_id' => null,
                'type' => 'labor',
                'name' => 'm² Revoque Grueso y Fino',
                'use_unit' => 'm2',
                'unit_value' => 0.00,
                'purchase_unit' => 'm2',
                'conversion_factor' => 1.0000,
            ],
        ];

        foreach ($presetResources as $resource) {
            Resource::updateOrCreate(
                ['name' => $resource['name'], 'user_id' => null],
                $resource
            );
        }
    }
}