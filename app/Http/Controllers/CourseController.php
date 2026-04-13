<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\CourseShift;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        return Inertia::render('courses/index', [
            'courses' => Course::with('shifts')->paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'workload'    => 'nullable|integer|min:1',
            'shifts'      => 'required|array|min:1',
            'shifts.*.shift' => 'required|in:manha,tarde,noite',
            'shifts.*.max_students' => 'required|integer|min:1',
        ]);

        $course = Course::create([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'workload'    => $validated['workload'],
        ]);

        foreach ($validated['shifts'] as $shiftData) {
            $course->shifts()->create($shiftData);
        }

        return redirect()->route('cursos')->with('success', 'Curso criado com sucesso.');
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'workload'    => 'nullable|integer|min:1',
            'shifts'      => 'required|array|min:1',
            'shifts.*.id' => 'nullable|integer|exists:course_shifts,id',
            'shifts.*.shift' => 'required|in:manha,tarde,noite',
            'shifts.*.max_students' => 'required|integer|min:1',
        ]);

        $course->update([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'workload'    => $validated['workload'],
        ]);

        //IDs dos shifts enviados (existentes)
        $existingIds = collect($validated['shifts'])->pluck('id')->filter()->toArray();
        //Remove os que não estão mais presentes
        $course->shifts()->whereNotIn('id', $existingIds)->delete();

        foreach ($validated['shifts'] as $shiftData) {
            if (isset($shiftData['id'])) {
                //Atualiza existente
                CourseShift::where('id', $shiftData['id'])->update([
                    'shift'        => $shiftData['shift'],
                    'max_students' => $shiftData['max_students'],
                ]);
            } else {
                //Cri novo
                $course->shifts()->create([
                    'shift'        => $shiftData['shift'],
                    'max_students' => $shiftData['max_students'],
                ]);
            }
        }

        return redirect()->route('cursos')->with('success', 'Curso atualizado.');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return back()->with('success', 'Curso removido.');
    }

}
