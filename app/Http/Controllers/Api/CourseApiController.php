<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Unit;

class CourseApiController extends Controller
{
    /**
     * GET /api/courses
     * Lista todos os cursos com seus turnos.
     */
    public function index()
    {
        $courses = Course::with('shifts')
            ->orderBy('title')
            ->get()
            ->map(fn($course) => [
                'id'          => $course->id,
                'title'       => $course->title,
                'description' => $course->description,
                'workload'    => $course->workload,
                'shifts'      => $course->shifts->map(fn($s) => [
                    'id'           => $s->id,
                    'shift'        => $s->shift,
                    'description'  => $s->description,
                    'start_time'   => $s->start_time,
                    'end_time'     => $s->end_time,
                    'days_of_week' => $s->days_of_week ?? [],
                    'max_students' => $s->max_students,
                ]),
            ]);

        return response()->json($courses);
    }

    /**
     * GET /api/courses/{course}/units
     * Lista as unidades que oferecem um curso específico.
     */
    public function units(Course $course)
    {
        $units = $course->units()
            ->where('active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'           => $u->id,
                'name'         => $u->name,
                'address'      => $u->address,
                'neighborhood' => $u->neighborhood,
                'city'         => $u->city,
                'phone'        => $u->phone,
            ]);

        return response()->json($units);
    }

    /**
     * GET /api/courses/{course}/units/{unit}/shifts
     * Lista os turnos disponíveis para um curso em uma unidade específica.
     * (Os turnos são do curso, filtrados pela seleção de unidade — a unidade
     *  já confirma que oferece o curso, os turnos pertencem ao curso.)
     */
    public function shifts(Course $course, Unit $unit)
    {
        // Verifica se a unidade oferece este curso
        $offersCourse = $course->units()->where('unit_id', $unit->id)->exists();

        if (!$offersCourse) {
            return response()->json(['message' => 'Esta unidade não oferece este curso.'], 404);
        }

        $shifts = $course->shifts()
            ->orderByRaw("FIELD(shift, 'manha', 'tarde', 'noite')")
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'shift'        => $s->shift,
                'description'  => $s->description,
                'start_time'   => $s->start_time,
                'end_time'     => $s->end_time,
                'days_of_week' => $s->days_of_week ?? [],
                'max_students' => $s->max_students,
            ]);

        return response()->json($shifts);
    }
}
