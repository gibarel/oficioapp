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
        $this->model = 'gemini-2.5-flash';
    }

    public function askAssistant(string $query, $user): string
    {
        if (empty($this->apiKey)) {
            return 'Error de configuración: La clave de Gemini (GEMINI_API_KEY) no está definida en el servidor.';
        }

        try {
            // Consultamos los trabajos registrados por el usuario de forma segura
            $totalWorks = Work::where('user_id', $user->id)->count();

            // O si tienes otra tabla o modelo para herramientas/recursos, puedes sumarlo aquí:
            // $totalResources = \App\Models\Resource::where('user_id', $user->id)->count();

            $context = "Datos actuales en la base de datos para el usuario {$user->name}:
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