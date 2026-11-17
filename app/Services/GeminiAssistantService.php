<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Work;

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
        // 📊 Recopilamos métricas clave de la base de datos de manera segura para este usuario
        $pendingWorks = Work::where('user_id', $user->id)->where('status', 'pending')->count();
        $completedWorks = Work::where('user_id', $user->id)->where('status', 'completed')->count();
        $totalWorks = Work::where('user_id', $user->id)->count();

        $context = "Datos actuales en la base de datos para el usuario {$user->name}:
        - Trabajos pendientes: {$pendingWorks}
        - Trabajos completados: {$completedWorks}
        - Total de trabajos registrados: {$totalWorks}";

        $prompt = "Eres el asistente virtual experto de OficioApp, una plataforma para profesionales y oficios. 
        Utiliza estrictamente el siguiente contexto de la base de datos para responder a la consulta del usuario de forma amable, clara y profesional. No inventes datos que no estén aquí.
        
        {$context}

        Pregunta del usuario: \"{$query}\"";

        $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            return 'Lo siento, tuve un problema de conexión con el servicio de IA en este momento.';
        }

        $result = $response->json();
        return $result['candidates'][0]['content']['parts'][0]['text'] ?? 'No pude procesar una respuesta clara.';
    }
}