<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile');

        return Inertia::render('Profile/Edit', [
            'profile' => $user->profile,
        ]);
    }

    public function updateBusiness(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'nullable|string|max:255',
            'trade_category' => 'nullable|string|max:100',
            'hourly_rate_reference' => 'nullable|numeric|min:0',
            'currency' => 'required|string|size:3',
            'phone' => 'nullable|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $user = $request->user();

        // Actualizar teléfono en el User
        if (isset($validated['phone'])) {
            $user->update(['phone' => $validated['phone']]);
        }

        $profileData = [
            'business_name' => $validated['business_name'] ?? null,
            'trade_category' => $validated['trade_category'] ?? null,
            'hourly_rate_reference' => $validated['hourly_rate_reference'] ?? 0,
            'currency' => $validated['currency'],
        ];

        // Manejo de la imagen de Logo
        if ($request->hasFile('logo')) {
            if ($user->profile && $user->profile->logo_path) {
                Storage::disk('public')->delete($user->profile->logo_path);
            }
            $profileData['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return back()->with('success', 'Perfil comercial actualizado correctamente.');
    }
}