<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiService;

class GeminiAIController extends Controller
{
    protected $geminiService;

    public function __construct(GeminiService $geminiService)
    {
        $this->geminiService = $geminiService;
    }

    public function analyze(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Máximo 10MB
            'purpose' => 'required|string|in:tool,before_after,price_list,general',
        ]);

        try {
            $file = $request->file('file');
            $purpose = $request->input('purpose');

            $analysisResult = $this->geminiService->analyzeFile($file, $purpose);

            return response()->json([
                'success' => true,
                'data' => $analysisResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}