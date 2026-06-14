<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Membership extends Model
{
    use HasUuids, SoftDeletes;

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

    /**
     * Total sessions included by the plan (null = unlimited).
     */
    public function getSessionsTotalAttribute(): ?int
    {
        return $this->commercialPlan?->sessions_total;
    }

    /**
     * Attended sessions for this patient within the membership period.
     */
    public function getSessionsUsedAttribute(): int
    {
        return DB::table('appointment_patient')
            ->join('appointments', 'appointments.id', '=', 'appointment_patient.appointment_id')
            ->where('appointment_patient.patient_id', $this->patient_id)
            ->where('appointment_patient.status', 'attended')
            ->whereBetween('appointments.appointment_date', [
                $this->start_date->toDateString(),
                $this->end_date->toDateString(),
            ])
            ->count();
    }

    /**
     * Remaining sessions (null = unlimited).
     */
    public function getSessionsRemainingAttribute(): ?int
    {
        $total = $this->sessions_total;

        if ($total === null) {
            return null;
        }

        return max(0, $total - $this->sessions_used);
    }
}
