<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicBudgetController extends Controller
{
    /**
     * Muestra la vista pública del presupuesto.
     */
    public function show(string $uuid): Response
    {
        $budget = Budget::where('uuid', $uuid)
            ->with(['items', 'user.profile'])
            ->firstOrFail();

        return Inertia::render('Public/BudgetShow', [
            'budget' => $budget,
        ]);
    }

    /**
     * Permite al cliente cambiar el estado (Aceptar o Rechazar).
     */
    public function updateStatus(Request $request, string $uuid)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $budget = Budget::where('uuid', $uuid)->firstOrFail();

        // Solo permitir responder si está pendiente/borrador/enviado
        if ($budget->status === 'accepted') {
            return back()->with('info', 'El presupuesto ya fue aceptado previamente.');
        }

        $budget->update([
            'status' => $request->status,
        ]);

        $message = $request->status === 'accepted'
            ? '¡Gracias! El presupuesto ha sido aceptado.'
            : 'Has rechazado el presupuesto.';

        return back()->with('success', $message);
    }
}