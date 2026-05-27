<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'appointment_date',
        'start_time',
        'duration_minutes',
        'notes',
        'title',
        'type',
        'max_participants'
    ];
    
    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'max_participants' => 'integer',
        ];
    }

    public function patients()
    {
        return $this->belongsToMany(Patient::class)
                    ->withPivot('status')
                    ->withTimestamps();
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
