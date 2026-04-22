<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'payment_method', 'status', 'message',
        'transaction_id', 'is_anonymous',
        'pagarme_order_id', 'pagarme_charge_id',
        'pix_qr_code', 'pix_qr_code_url',
        'boleto_url', 'boleto_barcode',
        'donor_name', 'donor_email', 'donor_cpf', 'donor_phone',
        'paid_at', 'webhook_payload',
    ];

    protected $casts = [
        'is_anonymous'    => 'boolean',
        'amount'          => 'decimal:2',
        'paid_at'         => 'datetime',
        'webhook_payload' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
