<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Course;
use App\Models\CourseShift;
use App\Models\Enrollment;

class EnrollmentController extends Controller
{
    public function enroll(Request $request)
    {
        //image max 2048
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'course_shift_id'  => 'required|exists:course_shifts,id',
            'rg_front'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'rg_back'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'full_name' => 'nullable|string|max:255',
            'phone'     => 'nullable|string|max:15',
            'cpf'       => 'nullable|string|max:14',
        ]);

        $user = $request->user();
        $isAnonymous = is_null($user);

        $shift = CourseShift::where('id', $validated['course_shift_id'])
                    ->where('course_id', $validated['course_id'])
                    ->first();

        if (!$shift) {
            return response()->json(['message' => 'Turno inválido para este curso.'], 400);
        }

         //Check vacancies
        $acceptedCount = Enrollment::where('course_shift_id', $shift->id)
                            ->where('status', 'accepted')
                            ->count();

        if ($acceptedCount >= $shift->max_students) {
            return response()->json(['message' => 'Este turno já está lotado.'], 400);
        }

        //VERIFY EXITS INSCRITION
        if (!$isAnonymous) {
            $exists = Enrollment::where('user_id', $user->id)
                        ->where('course_id', $validated['course_id'])
                        ->exists();
            if ($exists) {
                return response()->json(['message' => 'Você já está inscrito neste curso.'], 400);
            }
        }

        $rgFrontPath = null;
        $rgBackPath = null;

        if ($request->hasFile('rg_front')) {
            //SAVE 'public/documents/rg'
            $rgFrontPath = $request->file('rg_front')->store('documents/rg', 'public');
        }

        if ($request->hasFile('rg_back')) {
            $rgBackPath = $request->file('rg_back')->store('documents/rg', 'public');
        }

        $enrollment = Enrollment::create([
            'user_id'       => $user?->id,
            'course_id'     => $request->course_id,
            'course_shift_id' => $validated['course_shift_id'],
            'status'        => 'pending',
            'rg_front_path' => $rgFrontPath,
            'rg_back_path'  => $rgBackPath,
            'is_anonymous'  => $isAnonymous,
            'full_name'     => $request->full_name ?? null,
            'cpf'           => $request->cpf ?? null,
            'phone'         => $request->phone ?? null,
        ]);

        return response()->json([
            'message' => 'Inscrição enviada. Aguardando aprovação.',
            'enrollment' => $enrollment
        ], 201);
    }
}
