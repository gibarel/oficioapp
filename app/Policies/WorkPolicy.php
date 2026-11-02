<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Work;

class WorkPolicy
{
    /**
     * Determina si el usuario puede ver la lista de trabajos.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determina si el usuario puede ver un trabajo específico.
     */
    public function view(User $user, Work $work): bool
    {
        return $user->id === $work->user_id;
    }

    /**
     * Determina si el usuario puede crear trabajos.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determina si el usuario puede editar el trabajo.
     */
    public function update(User $user, Work $work): bool
    {
        return $user->id === $work->user_id;
    }

    /**
     * Determina si el usuario puede eliminar el trabajo.
     */
    public function delete(User $user, Work $work): bool
    {
        return $user->id === $work->user_id;
    }
}