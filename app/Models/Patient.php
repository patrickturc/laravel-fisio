<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'phone',
        'type',
        'cpf',
        'address',
        'user_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
    
    public function evolutions()
    {
        return $this->hasMany(Evolution::class, 'paciente_id');
    }
}
