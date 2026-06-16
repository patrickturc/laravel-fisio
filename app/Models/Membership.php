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
     * The active membership a session on $date should consume for a patient,
     * preferring one whose plan has a limited session count.
     */
    public static function activeForAttendance(string $patientId, string $date): ?self
    {
        return self::with('commercialPlan')
            ->where('patient_id', $patientId)
            ->where('status', 'active')
            ->where('start_date', '<=', $date)
            ->where('end_date', '>=', $date)
            ->get()
            ->sortByDesc(fn (self $m) => $m->commercialPlan?->sessions_total !== null ? 1 : 0)
            ->first();
    }

    /**
     * Attended sessions consumed. Counts pivots explicitly linked to this
     * membership, plus legacy attended pivots in the period with no link.
     */
    public function getSessionsUsedAttribute(): int
    {
        return DB::table('appointment_patient')
            ->join('appointments', 'appointments.id', '=', 'appointment_patient.appointment_id')
            ->where('appointment_patient.status', 'attended')
            ->where(function ($query) {
                $query->where('appointment_patient.membership_id', $this->id)
                    ->orWhere(function ($legacy) {
                        $legacy->whereNull('appointment_patient.membership_id')
                            ->where('appointment_patient.patient_id', $this->patient_id)
                            ->whereBetween('appointments.appointment_date', [
                                $this->start_date->toDateString(),
                                $this->end_date->toDateString(),
                            ]);
                    });
            })
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
