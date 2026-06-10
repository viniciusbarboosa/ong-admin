<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutUs extends Model
{
    protected $fillable = [
        'content',
        'image',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
