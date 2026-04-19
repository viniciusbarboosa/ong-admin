<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseShift;
use App\Models\Unit;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $courses = Course::with(['shifts', 'units'])
            ->when($search, function ($query, $search) {
                $query->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('courses/index', [
            'courses'  => $courses,
            'allUnits' => Unit::where('active', true)->orderBy('name')->get(['id', 'name']),
            'search'   => $search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'                      => 'required|string|max:255',
            'description'                => 'nullable|string',
            'workload'                   => 'nullable|integer|min:1',
            'shifts'                     => 'required|array|min:1',
            'shifts.*.shift'             => 'required|in:manha,tarde,noite',
            'shifts.*.description'       => 'nullable|string|max:255',
            'shifts.*.start_time'        => 'nullable|string|max:10',
            'shifts.*.end_time'          => 'nullable|string|max:10',
            'shifts.*.days_of_week'      => 'nullable|array',
            'shifts.*.days_of_week.*'    => 'string|in:seg,ter,qua,qui,sex,sab,dom',
            'shifts.*.max_students'      => 'required|integer|min:1',
            'unit_ids'                   => 'nullable|array',
            'unit_ids.*'                 => 'integer|exists:units,id',
        ]);

        $course = Course::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'workload'    => $validated['workload'] ?? null,
        ]);

        foreach ($validated['shifts'] as $shiftData) {
            $course->shifts()->create($shiftData);
        }

        if (!empty($validated['unit_ids'])) {
            $course->units()->sync($validated['unit_ids']);
        }

        return redirect()->route('cursos')->with('success', 'Curso criado com sucesso.');
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title'                      => 'required|string|max:255',
            'description'                => 'nullable|string',
            'workload'                   => 'nullable|integer|min:1',
            'shifts'                     => 'required|array|min:1',
            'shifts.*.id'                => 'nullable|integer|exists:course_shifts,id',
            'shifts.*.shift'             => 'required|in:manha,tarde,noite',
            'shifts.*.description'       => 'nullable|string|max:255',
            'shifts.*.start_time'        => 'nullable|string|max:10',
            'shifts.*.end_time'          => 'nullable|string|max:10',
            'shifts.*.days_of_week'      => 'nullable|array',
            'shifts.*.days_of_week.*'    => 'string|in:seg,ter,qua,qui,sex,sab,dom',
            'shifts.*.max_students'      => 'required|integer|min:1',
            'unit_ids'                   => 'nullable|array',
            'unit_ids.*'                 => 'integer|exists:units,id',
        ]);

        $course->update([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'workload'    => $validated['workload'] ?? null,
        ]);

        // Remove turnos que não estão mais presentes
        $existingIds = collect($validated['shifts'])->pluck('id')->filter()->toArray();
        $course->shifts()->whereNotIn('id', $existingIds)->delete();

        foreach ($validated['shifts'] as $shiftData) {
            if (isset($shiftData['id'])) {
                CourseShift::where('id', $shiftData['id'])->update([
                    'shift'        => $shiftData['shift'],
                    'description'  => $shiftData['description'] ?? null,
                    'start_time'   => $shiftData['start_time'] ?? null,
                    'end_time'     => $shiftData['end_time'] ?? null,
                    'days_of_week' => $shiftData['days_of_week'] ?? null,
                    'max_students' => $shiftData['max_students'],
                ]);
            } else {
                $course->shifts()->create([
                    'shift'        => $shiftData['shift'],
                    'description'  => $shiftData['description'] ?? null,
                    'start_time'   => $shiftData['start_time'] ?? null,
                    'end_time'     => $shiftData['end_time'] ?? null,
                    'days_of_week' => $shiftData['days_of_week'] ?? null,
                    'max_students' => $shiftData['max_students'],
                ]);
            }
        }

        // Sincroniza unidades
        $course->units()->sync($validated['unit_ids'] ?? []);

        return redirect()->route('cursos')->with('success', 'Curso atualizado.');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return back()->with('success', 'Curso removido.');
    }
}
