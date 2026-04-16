<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseShift extends Model
{
    protected $fillable = [
        'course_id',
        'shift',
        'description',
        'start_time',
        'end_time',
        'days_of_week',
        'max_students',
    ];

    protected $casts = [
        'days_of_week' => 'array',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
