<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'work_name_snapshot',
        'calculation_method_used',
        'quantity',
        'unit_price',
        'subtotal_price',
        'details_snapshot',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal_price' => 'decimal:2',
        'details_snapshot' => 'array', // Array/JSON para inmutabilidad histórica
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }
}