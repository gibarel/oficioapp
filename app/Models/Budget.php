<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Budget extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'budget_number',
        'client_name',
        'client_phone',
        'client_address',
        'currency',
        'subtotal_cost',
        'contingency_amount',
        'profit_amount',
        'total_price',
        'status',
        'execution_conditions',
        'issued_at',
    ];

    protected $casts = [
        'subtotal_cost' => 'decimal:2',
        'contingency_amount' => 'decimal:2',
        'profit_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'issued_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($budget) {
            if (empty($budget->uuid)) {
                $budget->uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BudgetItem::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }
}