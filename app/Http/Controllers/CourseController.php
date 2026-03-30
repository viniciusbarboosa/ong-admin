<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Course; 
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        return Inertia::render('courses/index', [
            'courses' => Course::paginate(10)
        ]);
    }

    public function store(Request $request)
    {
        Course::create($request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'workload' => 'nullable|integer'
        ]));

        return back();
    }

    public function update(Request $request, Course $course)
    {
        $course->update($request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'workload' => 'nullable|integer'
        ]));

        return back();
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return back();
    }
}
