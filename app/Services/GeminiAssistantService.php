<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Work;
use Exception;

class GeminiAssistantService
{
    protected string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.gemini.key') ?: env('GEMINI_API_KEY'));
        $this->model = 'gemini-3.8-flash';
    }

    public function askAssistant(string $query, $user): string
    {
        if (empty($this->apiKey)) {
            return 'Error de configuración: La clave de Gemini (GEMINI_API_KEY) no está definida en el servidor.';
        }

        try {
            $totalWorks = Work::where('user_id', $user->id)->count();

            $context = "Datos actuales en la base de datos para el usuario {$user->name}:\n"
                . "- Total de trabajos registrados: {$totalWorks}";

            $prompt = "Eres el asistente virtual experto de OficioApp. Utiliza estrictamente el siguiente contexto de la base de datos para responder a la consulta del usuario de forma amable, clara y profesional. No inventes datos que no estén aquí.\n\n"
                . "{$context}\n\n"
                . "Pregunta del usuario: \"{$query}\"";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $this->apiKey,
            ])
                ->connectTimeout(5)
                ->timeout(10)
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
            return $result['candidates'][0]['content']['parts'][0]['text'] ?? 'No pude procesar una respuesta clara.';
        } catch (Exception $e) {
            Log::error('Gemini Assistant Exception: ' . $e->getMessage());
            return 'Excepción capturada: ' . $e->getMessage();
        }
    }
}