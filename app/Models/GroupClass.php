<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupClass extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'color',
        'max_participants',
        'status',
    ];

    public function schedules()
    {
        return $this->hasMany(GroupClassSchedule::class);
    }

    public function patients()
    {
        return $this->belongsToMany(Patient::class, 'group_class_patient')
            ->withTimestamps();
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
