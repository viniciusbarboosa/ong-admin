<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'status',
        'is_anonymous',
        'rg_front_path',
        'course_shift_id',
        'rg_back_path',
        'full_name',
        'cpf',
        'phone'
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
    ];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(CourseShift::class, 'course_shift_id');
    }
}
