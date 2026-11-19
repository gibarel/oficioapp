<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\UploadedFile;
use Exception;

class GeminiService
{
    protected $apiKey;
    protected $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        // Usamos gemini-2.5-flash o gemini-1.5-flash para soporte multimodal (imágenes, pdfs, texto)
        $this->model = 'gemini-1.5-flash'; 
    }

    public function analyzeFile(UploadedFile $file, string $purpose)
    {
        $mimeType = $file->getMimeType();
        $fileData = base64_encode(file_get_contents($file->getRealPath()));

        // Definimos el prompt según el propósito del usuario
        $prompt = $this->getPromptByPurpose($purpose);

        $response = Http::post("https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $fileData
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        if ($response->failed()) {
            throw new Exception('Error al comunicarse con la API de Gemini: ' . $response->body());
        }

        $result = $response->json();
        
        // Extraemos la respuesta generada por la IA
        $textResponse = $result['candidates'][0]['content']['parts'][0]['text'] ?? '{}';

        // Intentamos limpiar y parsear el JSON si la IA lo devuelve formateado
        return $this->parseJsonResponse($textResponse);
    }

    protected function getPromptByPurpose(string $purpose): string
    {
        return match ($purpose) {
            'tool' => 'Analiza esta imagen y detecta qué herramienta o equipo de trabajo es. Devuelve un JSON estricto con las siguientes claves: "name" (nombre de la herramienta), "category" (categoría o tipo), y "confidence" (nivel de confianza estimado).',
            'before_after' => 'Describe esta imagen de obra o trabajo de oficio de forma técnica y profesional para dejar un registro en un presupuesto. Devuelve un JSON con: "description" (descripción breve) y "tags" (array de etiquetas sugeridas).',
            'price_list' => 'Extrae de este archivo (imagen, pdf o planilla) todos los ítems de materiales o productos con sus precios unitarios. Devuelve un JSON estructurado estrictamente como un array de objetos bajo la clave "items", donde cada objeto tenga "name" y "price".',
            default => 'Analiza este archivo y proporciona un resumen estructurado en JSON con los datos más relevantes.',
        };
    }

    protected function parseJsonResponse(string $text)
    {
        // Limpiamos los bloques de código markdown si los trae la respuesta de Gemini
        $cleanText = preg_replace('/^```json\s*|\s*```$/i', '', trim($text));
        $data = json_decode($cleanText, true);

        return $data ?? ['raw_response' => $text];
    }
}