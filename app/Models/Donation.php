<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'payment_method', 'status', 'message',
        'transaction_id',
        'is_anonymous'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'amount' => 'decimal:2'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
