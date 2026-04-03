<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Course;
use App\Models\Enrollment;

class EnrollmentController extends Controller
{
    public function enroll(Request $request)
    {
        //image max 2048
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'rg_front'  => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'rg_back'   => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        //VERIFY EXITS INSCRITION
        if (Enrollment::where('user_id', $user->id)->where('course_id', $request->course_id)->exists()) {
            return response()->json(['message' => 'Inscrição já realizada para este curso.'], 400);
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
            'user_id'       => $user->id,
            'course_id'     => $request->course_id,
            'status'        => 'pending',
            'rg_front_path' => $rgFrontPath,
            'rg_back_path'  => $rgBackPath,
        ]);

        return response()->json([
            'message' => 'Inscrição enviada. Aguardando aprovação.',
            'enrollment' => $enrollment
        ], 201);
    }
}
