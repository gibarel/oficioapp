<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));

        $clients = Client::query()
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->withCount('budgets')
            ->withSum('budgets', 'total_price')
            ->when($search !== '', function ($query) use ($search) {
                $like = '%' . $search . '%';
                $query->where(function ($sub) use ($like) {
                    $sub->where('name', 'ilike', $like)
                        ->orWhere('business_name', 'ilike', $like)
                        ->orWhere('phone', 'ilike', $like);
                });
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'business_name' => ['nullable', 'string', 'max:100'],
            'tax_id' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $request->user()->clients()->create([
            ...$validated,
            'is_active' => true,
        ]);

        return back()->with('success', 'Cliente guardado correctamente.');
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'business_name' => ['nullable', 'string', 'max:100'],
            'tax_id' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $client->update($validated);

        return back()->with('success', 'Cliente actualizado.');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        abort_unless($client->user_id === $request->user()->id, 403);

        $client->update(['is_active' => false]);

        return back()->with('success', 'Cliente dado de baja.');
    }
}