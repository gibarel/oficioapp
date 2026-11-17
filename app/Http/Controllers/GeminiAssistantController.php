<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\GeminiAssistantService;

class GeminiAssistantController extends Controller
{
    protected $assistantService;

    public function __construct(GeminiAssistantService $assistantService)
    {
        $this->assistantService = $assistantService;
    }

    public function chat(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
        ]);

        try {
            $answer = $this->assistantService->askAssistant($request->input('query'), $request->user());

            return response()->json([
                'success' => true,
                'answer' => $answer
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}