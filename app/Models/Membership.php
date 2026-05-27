<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Membership extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id',
        'commercial_plan_id',
        'plan_name',
        'start_date',
        'end_date',
        'price',
        'status',
        'billing_day',
        'last_billed_at',
    ];

    public function commercialPlan()
    {
        return $this->belongsTo(CommercialPlan::class);
    }

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'last_billed_at' => 'date',
            'price' => 'decimal:2',
            'billing_day' => 'integer',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function financialTransactions()
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
