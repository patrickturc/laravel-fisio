<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RecurringExpense extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'description',
        'amount',
        'category',
        'recurrence',
        'day_of_month',
        'is_active',
        'last_generated_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'day_of_month' => 'integer',
            'is_active' => 'boolean',
            'last_generated_at' => 'date',
        ];
    }

    public function financialTransactions()
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
