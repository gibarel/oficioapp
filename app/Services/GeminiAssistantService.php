<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Work;
use Exception;

class GeminiAssistantService
{
    protected $apiKey;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->model = 'gemini-1.5-flash';
    }

    public function askAssistant(string $query, $user): string
    {
        if (empty($this->apiKey)) {
            return 'Error de configuración: La clave de Gemini (GEMINI_API_KEY) no está definida en el servidor.';
        }

        try {
            $pendingWorks = Work::where('user_id', $user->id)->where('status', 'pending')->count();
            $completedWorks = Work::where('user_id', $user->id)->where('status', 'completed')->count();
            $totalWorks = Work::where('user_id', $user->id)->count();

            $context = "Datos actuales en la base de datos para el usuario {$user->name}:
            - Trabajos pendientes: {$pendingWorks}
            - Trabajos completados: {$completedWorks}
            - Total de trabajos registrados: {$totalWorks}";

            $prompt = "Eres el asistente virtual experto de OficioApp. Utiliza estrictamente el siguiente contexto de la base de datos para responder a la consulta del usuario de forma amable, clara y profesional. No inventes datos que no estén aquí.
            
            {$context}

            Pregunta del usuario: \"{$query}\"";

            $response = Http::timeout(15)->post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            if ($response->failed()) {
                Log::error('Gemini API Error: ' . $response->body());
                return 'Lo siento, la API de Gemini rechazó la consulta en este momento.';
            }

            $result = $response->json();
            return $result['candidates'][0]['content']['parts'][0]['text'] ?? 'No pude procesar una respuesta clara.';

        } catch (Exception $e) {
            Log::error('Gemini Assistant Exception: ' . $e->getMessage());
            return 'Ocurrió un error interno al conectar con el asistente inteligente.';
        }
    }
}