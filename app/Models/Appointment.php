<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasUuids;

    protected $fillable = [
        'patient_id',
        'user_id',
        'appointment_date',
        'start_time',
        'duration_minutes',
        'status',
        'notes'
    ];
    
    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
        ];
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
