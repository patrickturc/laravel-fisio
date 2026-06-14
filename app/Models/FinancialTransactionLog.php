<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FinancialTransactionLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'financial_transaction_id',
        'action',
        'from_status',
        'to_status',
        'note',
        'user_id',
    ];

    public function transaction()
    {
        return $this->belongsTo(FinancialTransaction::class, 'financial_transaction_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
