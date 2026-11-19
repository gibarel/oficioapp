<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Profile;
use App\Models\Resource;
use App\Models\Work;
use Exception;
use Illuminate\Http\Client\ConnectionException;
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
            Log::error('Gemini Assistant: GEMINI_API_KEY no configurada.');
            return 'El asistente no está disponible en este momento por un problema de configuración. Por favor, avisá al administrador.';
        }

        try {
            $contexto = $this->obtenerContextoUsuario($user);
            $contextJson = json_encode($contexto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            $prompt = "Eres el asistente virtual experto de OficioApp. Responde en español de forma amable, clara, directa y práctica.\n"
                . "Reglas obligatorias:\n"
                . "1. Datos reales del sistema: Usa estrictamente los datos del JSON para informar registros existentes (trabajos, recursos personales o globales precargados, presupuestos, finanzas). No inventes registros, precios ni estados que no figuren en el JSON.\n"
                . "2. Lenguaje natural (sin tecnicismos internos): Nunca menciones IDs internos de base de datos (como 'id 27') ni nombres técnicos de columnas/códigos en inglés (traduce 'asset' como 'herramienta o equipo', 'material' como 'material/insumo', 'labor' como 'mano de obra', 'draft' como 'borrador/pendiente').\n"
                . "3. Consultas técnicas o de cálculo no presentes en la BD: Cuando el usuario pregunte por rendimientos, cantidades estimadas o buenas prácticas del oficio (por ejemplo, cuánta pintura rinde en ciertos metros cuadrados), da primero una estimación orientativa útil basada en conocimiento general del rubro, vinculándola con los recursos o trabajos que tenga cargados si corresponde, y aclara brevemente que es una referencia orientativa y no un dato guardado en su catálogo ni la ficha técnica del fabricante.\n"
                . "4. Pertinencia: Responde únicamente lo que el usuario preguntó. Solo menciona el estado de los presupuestos o que los trabajos del catálogo no tienen estado pendiente cuando el usuario pregunte explícitamente por pendientes, estados o presupuestos.\n"
                . "5. Formato: Escribe siempre en texto plano, sin usar asteriscos dobles (**) ni formato Markdown.\n\n"
                . "Contexto del usuario:\n"
                . "{$contextJson}\n\n"
                . "Pregunta del usuario: \"{$query}\"";

            $response = $this->consultarGemini($prompt);

            if ($response->failed()) {
                $status = $response->status();
                Log::error("Gemini API Error (HTTP {$status}): " . $response->body());

                if ($status === 503 || $status === 429) {
                    return 'El asistente está recibiendo muchas consultas en este momento. Esperá unos segundos y volvé a intentarlo.';
                }

                return 'No pude obtener una respuesta del asistente en este momento. Intentá nuevamente en unos instantes.';
            }

            $result = $response->json();
            $texto = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Limpia asteriscos residuales de Markdown
            $textoLimpio = trim(str_replace('**', '', $texto));

            return $textoLimpio !== ''
                ? $textoLimpio
                : 'No pude generar una respuesta clara para esa consulta. ¿Podrías reformularla?';
        } catch (ConnectionException $e) {
            Log::error('Gemini Assistant Connection/Timeout Exception: ' . $e->getMessage());
            return 'La consulta tardó más de lo esperado por una demora de conexión con el servicio de IA. Por favor, volvé a intentarlo en unos segundos.';
        } catch (Exception $e) {
            Log::error('Gemini Assistant Exception: ' . $e->getMessage());
            return 'Ocurrió un inconveniente temporal al procesar tu consulta. Intentá nuevamente en unos instantes.';
        }
    }

    private function consultarGemini(string $prompt)
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $intentos = 0;
        $maxIntentos = 2; // 1 intento inicial + 1 reintento rápido si devuelve 503

        do {
            $intentos++;
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey,
            ])
                ->connectTimeout(8)
                ->timeout(20)
                ->post($url, $payload);

            if ($response->status() !== 503 || $intentos >= $maxIntentos) {
                return $response;
            }

            usleep(600000); // Espera 0.6s antes del reintento por 503
        } while ($intentos < $maxIntentos);

        return $response;
    }

    private function obtenerContextoUsuario($user): array
    {
        $profile = Profile::where('user_id', $user->id)->first();

        $works = Work::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get(['name', 'calculation_method', 'reference_unit', 'base_price', 'is_template']);

        // Incluye explícitamente recursos personales (user_id = $user->id) y globales precargados (user_id IS NULL)
        $resources = Resource::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            })
            ->orderBy('type')
            ->orderBy('name')
            ->get([
                'user_id',
                'type',
                'name',
                'use_unit',
                'unit_value',
                'purchase_unit',
                'acquisition_cost',
                'hourly_depreciation_rate',
            ]);

        $tipoLegible = [
            'material' => 'material',
            'asset' => 'herramienta_o_equipo',
            'labor' => 'mano_de_obra',
        ];

        $resourcesConOrigen = $resources->map(function ($r) use ($tipoLegible) {
            return [
                'nombre' => $r->name,
                'tipo' => $tipoLegible[$r->type] ?? ($r->type ?: 'otro'),
                'origen' => is_null($r->user_id) ? 'global' : 'personal',
                'unidad_uso' => $r->use_unit,
                'valor_unitario' => $r->unit_value,
                'unidad_compra' => $r->purchase_unit,
                'costo_adquisicion' => $r->acquisition_cost,
                'depreciacion_hora' => $r->hourly_depreciation_rate,
            ];
        });

        $budgets = Budget::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get([
                'budget_number',
                'client_name',
                'currency',
                'subtotal_cost',
                'total_price',
                'status',
                'issued_at',
            ]);

        $estadoLegible = [
            'draft' => 'pendiente_borrador',
            'accepted' => 'aprobado',
            'rejected' => 'rechazado',
        ];

        $budgetsPorEstado = $budgets->groupBy(fn ($b) => $estadoLegible[$b->status] ?? ($b->status ?: 'sin_estado'))
            ->map->count()
            ->toArray();

        $incomesTotal = (float) Income::where('user_id', $user->id)->sum('amount');
        $expensesTotal = (float) Expense::where('user_id', $user->id)->sum('amount');

        return [
            'usuario' => [
                'nombre' => $user->name,
                'negocio' => $profile->business_name ?? null,
                'rubro' => $profile->trade_category ?? null,
                'moneda_referencia' => $profile->currency ?? null,
                'valor_hora_referencia' => $profile->hourly_rate_reference ?? null,
            ],
            'trabajos' => [
                'total' => $works->count(),
                'nota_estado' => 'Los trabajos del catálogo son plantillas/servicios base sin estado pendiente; los estados reales pertenecen a los presupuestos.',
                'listado' => $works->take(25)->map(fn ($w) => [
                    'nombre' => $w->name,
                    'metodo' => $w->calculation_method,
                    'unidad' => $w->reference_unit,
                    'precio_base' => $w->base_price,
                    'plantilla' => (bool) $w->is_template,
                ])->values()->toArray(),
            ],
            'recursos' => [
                'total_disponibles' => $resourcesConOrigen->count(),
                'total_globales_precargados' => $resourcesConOrigen->where('origen', 'global')->count(),
                'total_personales' => $resourcesConOrigen->where('origen', 'personal')->count(),
                'por_tipo' => $resourcesConOrigen->groupBy('tipo')
                    ->map->count()
                    ->toArray(),
                'por_tipo_y_origen' => $resourcesConOrigen->groupBy(fn ($r) => $r['tipo'] . ' (' . $r['origen'] . ')')
                    ->map->count()
                    ->toArray(),
                'listado' => $resourcesConOrigen->take(60)->values()->toArray(),
            ],
            'presupuestos' => [
                'total' => $budgets->count(),
                'por_estado' => $budgetsPorEstado,
                'monto_total' => round((float) $budgets->sum('total_price'), 2),
                'listado' => $budgets->take(20)->map(fn ($b) => [
                    'numero' => $b->budget_number,
                    'cliente' => $b->client_name,
                    'estado' => $estadoLegible[$b->status] ?? $b->status,
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