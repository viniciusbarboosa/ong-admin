<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class CourseShiftController extends Controller
{
    //LIST  TURN WITH VANCIES
    public function index(Course $course)
    {
        $shifts = $course->shifts()->get()->map(function ($shift) {
            $accepted = Enrollment::where('course_shift_id', $shift->id)
                            ->where('status', 'accepted')
                            ->count();

            return [
                'id'           => $shift->id,
                'shift'        => $shift->shift,
                'max_students' => $shift->max_students,
                'available'    => max(0, $shift->max_students - $accepted),
                'is_full'      => $accepted >= $shift->max_students,
            ];
        });

        return response()->json($shifts);
    }
}
