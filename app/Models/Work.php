<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Work extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'calculation_method',
        'reference_unit',
        'base_price',
        'contingency_percentage',
        'profit_margin_percentage',
        'notes',
        'is_template',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'contingency_percentage' => 'decimal:2',
        'profit_margin_percentage' => 'decimal:2',
        'is_template' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resources(): BelongsToMany
    {
        return $this->belongsToMany(Resource::class)
            ->withPivot([
                'quantity',
                'custom_unit_value',
                'allocation_type',
                'allocation_value',
                'is_client_provided',
            ])
            ->withTimestamps();
    }
}