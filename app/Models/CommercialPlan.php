<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CommercialPlan extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'price',
        'duration_months',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_months' => 'integer',
        ];
    }
}
