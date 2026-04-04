<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Enrollment;
use Inertia\Inertia;

class EnrollmentAdminController extends Controller
{
    public function index()
    {
        //WITH USER APP
        $enrollments = Enrollment::with(['user', 'course'])
            ->latest()
            ->paginate(10);

        return Inertia::render('enrollments/index', [
            'enrollments' => $enrollments
        ]);
    }

    public function updateStatus(Request $request, Enrollment $enrollment)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected'
        ]);

        $enrollment->update([
            'status' => $request->status
        ]);

        return back()->with('status', 'Status atualizado com sucesso!');
    }
}
