<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseShift extends Model
{
    protected $fillable = [
        'course_id',
        'shift',
        'max_students',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
