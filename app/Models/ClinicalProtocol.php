<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ClinicalProtocol extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'total_sessions',
        'notes',
    ];

    public function evolutions()
    {
        return $this->hasMany(Evolution::class);
    }
}
