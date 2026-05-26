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
            'price' => 'decimal:2',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
