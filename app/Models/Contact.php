<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'email',
        'phone',
        'cnpj',
        'address',
        'neighborhood',
        'city',
        'state',
        'zip_code',
        'website',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
