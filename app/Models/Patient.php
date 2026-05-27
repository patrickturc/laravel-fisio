<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'nickname',
        'phone',
        'email',
        'birthdate',
        'gender',
        'type',
        'cpf',
        'rg',
        'profession',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'health_notes',
        'cep',
        'street',
        'number',
        'complement',
        'neighborhood',
        'city',
        'state',
        'user_id'
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
        ];
    }

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

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function activeMembership()
    {
        return $this->hasOne(Membership::class)->where('status', 'active')->latest('end_date');
    }

    public function financialTransactions()
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
