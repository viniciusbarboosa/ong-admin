<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'payment_method', 'status', 'message', 'transaction_id'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
