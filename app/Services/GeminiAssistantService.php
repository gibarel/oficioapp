<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Profile;
use App\Models\Resource;
use App\Models\Work;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAssistantService
{
    protected string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.gemini.key') ?: env('GEMINI_API_KEY'));
        $this->model = 'gemini-3.1-flash-lite';
    }

    public function askAssistant(string $query, $user): string
    {
        if (empty($this->apiKey)) {
            return 'Error de configuración: La clave de Gemini (GEMINI_API_KEY) no está definida en el servidor.';
        }

        try {
            $contexto = $this->obtenerContextoUsuario($user);
            $contextJson = json_encode($contexto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $prompt = "Eres el asistente virtual experto de OficioApp. Responde en español de forma amable, clara y concisa utilizando estrictamente los datos reales del contexto JSON.\n"
                . "Reglas obligatorias:\n"
                . "- No inventes datos, estados ni registros que no figuren en el JSON.\n"
                . "- Si en el modelo de trabajos no existe un campo de 'pendiente', acláralo con precisión y muestra los estados reales de presupuestos (budgets) o el detalle de trabajos disponibles.\n"
                . "- Escribe siempre en texto plano, sin usar asteriscos dobles (**) ni formato Markdown.\n\n"
                . "Contexto del usuario:\n"
                . "{$contextJson}\n\n"
                . "Pregunta del usuario: \"{$query}\"";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey,
            ])
                ->connectTimeout(10)
                ->timeout(30)
                ->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent",
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt]
                                ]
                            ]
                        ]
                    ]
                );

            if ($response->failed()) {
                Log::error('Gemini API Error: ' . $response->body());
                return 'Error de API Gemini: ' . $response->body();
            }

            $result = $response->json();
            $texto = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'No pude procesar una respuesta clara.';

            // Evita asteriscos ** en el chat aunque el modelo intente usarlos
            $textoLimpio = trim(str_replace('**', '', $texto));

            return $textoLimpio !== '' ? $textoLimpio : 'No pude procesar una respuesta clara.';
        } catch (Exception $e) {
            Log::error('Gemini Assistant Exception: ' . $e->getMessage());
            return 'Excepción capturada: ' . $e->getMessage();
        }
    }

    private function obtenerContextoUsuario($user): array
    {
        $profile = Profile::where('user_id', $user->id)->first();

        $works = Work::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get(['id', 'name', 'calculation_method', 'reference_unit', 'base_price', 'is_template']);

        // Resource ya aplica el scope available_for_user según auth()->id()
        $resources = Resource::orderBy('type')
            ->orderBy('name')
            ->get([
                'id',
                'user_id',
                'type',
                'name',
                'use_unit',
                'unit_value',
                'purchase_unit',
                'acquisition_cost',
                'hourly_depreciation_rate',
                'is_sponsored',
            ]);

        $budgets = Budget::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get([
                'id',
                'budget_number',
                'client_name',
                'currency',
                'subtotal_cost',
                'total_price',
                'status',
                'issued_at',
            ]);

        $budgetsPorEstado = $budgets->groupBy(fn ($b) => $b->status ?: 'sin_estado')
            ->map->count()
            ->toArray();

        $incomesTotal = (float) Income::where('user_id', $user->id)->sum('amount');
        $expensesTotal = (float) Expense::where('user_id', $user->id)->sum('amount');

        return [
            'usuario' => [
                'id' => $user->id,
                'nombre' => $user->name,
                'negocio' => $profile->business_name ?? null,
                'rubro' => $profile->trade_category ?? null,
                'moneda_referencia' => $profile->currency ?? null,
                'valor_hora_referencia' => $profile->hourly_rate_reference ?? null,
            ],
            'trabajos' => [
                'total' => $works->count(),
                'nota_estado' => 'El modelo Work no almacena estado pendiente/finalizado; los estados de presupuestos figuran en presupuestos.por_estado.',
                'listado' => $works->take(25)->map(fn ($w) => [
                    'nombre' => $w->name,
                    'metodo' => $w->calculation_method,
                    'unidad' => $w->reference_unit,
                    'precio_base' => $w->base_price,
                    'plantilla' => (bool) $w->is_template,
                ])->values()->toArray(),
            ],
            'recursos' => [
                'total' => $resources->count(),
                'por_tipo' => $resources->groupBy(fn ($r) => $r->type ?: 'sin_tipo')
                    ->map->count()
                    ->toArray(),
                'listado' => $resources->take(30)->map(fn ($r) => [
                    'nombre' => $r->name,
                    'tipo' => $r->type,
                    'unidad_uso' => $r->use_unit,
                    'valor_unitario' => $r->unit_value,
                    'costo_adquisicion' => $r->acquisition_cost,
                    'depreciacion_hora' => $r->hourly_depreciation_rate,
                    'es_propio' => $r->user_id === $user->id,
                ])->values()->toArray(),
            ],
            'presupuestos' => [
                'total' => $budgets->count(),
                'por_estado' => $budgetsPorEstado,
                'monto_total' => round((float) $budgets->sum('total_price'), 2),
                'listado' => $budgets->take(20)->map(fn ($b) => [
                    'numero' => $b->budget_number,
                    'cliente' => $b->client_name,
                    'estado' => $b->status,
                    'moneda' => $b->currency,
                    'total' => $b->total_price,
                    'emitido' => optional($b->issued_at)->format('Y-m-d'),
                ])->values()->toArray(),
            ],
            'finanzas' => [
                'ingresos_totales' => round($incomesTotal, 2),
                'egresos_totales' => round($expensesTotal, 2),
                'balance_ingresos_menos_egresos' => round($incomesTotal - $expensesTotal, 2),
            ],
        ];
    }
}