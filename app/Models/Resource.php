<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resource extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'name',
        'use_unit',
        'unit_value',
        'purchase_unit',
        'conversion_factor',
        'acquisition_cost',
        'useful_life_months',
        'estimated_monthly_use_hours',
        'hourly_depreciation_rate',
        'is_sponsored',
    ];

    protected $casts = [
        'unit_value' => 'decimal:2',
        'conversion_factor' => 'decimal:4',
        'acquisition_cost' => 'decimal:2',
        'hourly_depreciation_rate' => 'decimal:2',
        'is_sponsored' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(ResourceAlias::class);
    }

    public function works(): BelongsToMany
    {
        return $this->belongsToMany(Work::class)
            ->withPivot([
                'quantity',
                'custom_unit_value',
                'allocation_type',
                'allocation_value',
                'is_client_provided',
            ])
            ->withTimestamps();
    }

    /**
     * Calcula y actualiza la tasa de depreciación por hora para bienes/herramientas propias.
     */
    public function calculateDepreciationRate(): ?float
    {
        if ($this->type !== 'asset' || !$this->acquisition_cost || !$this->useful_life_months || !$this->estimated_monthly_use_hours) {
            return null;
        }

        $totalHours = $this->useful_life_months * $this->estimated_monthly_use_hours;
        
        return $totalHours > 0 ? round($this->acquisition_cost / $totalHours, 2) : 0.00;
    }
}