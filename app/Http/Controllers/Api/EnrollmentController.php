<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Course;
use App\Models\CourseShift;
use App\Models\Enrollment;
use App\Models\User;

class EnrollmentController extends Controller
{
    public function enroll(Request $request)
    {
        $request->validate([
            'course_id'       => 'required|exists:courses,id',
            'unit_id'         => 'required|exists:units,id',
            'course_shift_id' => 'required|exists:course_shifts,id',
            'rg_front'        => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'rg_back'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'full_name'       => 'required|string|max:255',
            'phone'           => 'nullable|string|max:15',
            'cpf'             => 'required|string|max:14',
            'password'        => 'nullable|string|min:6',
        ]);

        // Valida se a unidade oferece este curso
        $course = Course::findOrFail($request->course_id);
        $unitOffersCourse = $course->units()->where('unit_id', $request->unit_id)->exists();
        if (!$unitOffersCourse) {
            return response()->json(['message' => 'Esta unidade não oferece este curso.'], 422);
        }

        // Valida se o turno pertence ao curso
        $shiftBelongsToCourse = CourseShift::where('id', $request->course_shift_id)
            ->where('course_id', $request->course_id)
            ->exists();
        if (!$shiftBelongsToCourse) {
            return response()->json(['message' => 'Turno inválido para este curso.'], 422);
        }

        // ── Resolução de conta ────────────────────────────────────────────────────
        $user       = $request->user(); // null se não autenticado
        $token      = null;
        $isAnonymous = true;

        if (is_null($user) && $request->filled('password')) {
            $cpfLimpo = preg_replace('/\D/', '', $request->cpf);

            $userExistente = User::where('cpf', $request->cpf)
                ->orWhere('cpf', $cpfLimpo)
                ->first();

            if ($userExistente) {
                // CPF já tem conta — valida a senha
                if (!Hash::check($request->password, $userExistente->password)) {
                    return response()->json([
                        'message' => 'CPF já possui uma conta. A senha informada está incorreta.',
                        'field'   => 'password',
                    ], 422);
                }
                $user = $userExistente;
            } else {
                // Cria conta nova usando CPF como identificador
                // Gera um e-mail interno único baseado no CPF (não precisa ser real)
                $emailInterno = 'cpf.' . $cpfLimpo . '@app.procrianca.internal';

                $user = User::create([
                    'name'      => $request->full_name,
                    'email'     => $emailInterno,
                    'cpf'       => $request->cpf,
                    'password'  => Hash::make($request->password),
                    'type_user' => 'U',
                    'active'    => true,
                ]);
            }

            $isAnonymous = false;
            // Revoga tokens anteriores do app e emite um novo
            $user->tokens()->where('name', 'app-mobile')->delete();
            $token = $user->createToken('app-mobile')->plainTextToken;
        }

        // Verifica inscrição duplicada para usuários autenticados/criados
        if (!$isAnonymous && $user) {
            if (Enrollment::where('user_id', $user->id)
                ->where('course_id', $request->course_id)
                ->exists()
            ) {
                return response()->json(['message' => 'Você já tem uma inscrição neste curso.'], 400);
            }
        }

        $rgFrontPath = null;
        $rgBackPath  = null;

        if ($request->hasFile('rg_front')) {
            $rgFrontPath = $request->file('rg_front')->store('documents/rg', 'public');
        }
        if ($request->hasFile('rg_back')) {
            $rgBackPath = $request->file('rg_back')->store('documents/rg', 'public');
        }

        $enrollment = Enrollment::create([
            'user_id'         => $user?->id,
            'course_id'       => $request->course_id,
            'unit_id'         => $request->unit_id,
            'course_shift_id' => $request->course_shift_id,
            'status'          => 'pending',
            'rg_front_path'   => $rgFrontPath,
            'rg_back_path'    => $rgBackPath,
            'is_anonymous'    => $isAnonymous,
            'full_name'       => $request->full_name,
            'cpf'             => $request->cpf,
            'phone'           => $request->phone,
        ]);

        $enrollment->load(['course', 'unit', 'shift']);

        return response()->json([
            'message'    => 'Pré-inscrição enviada com sucesso. Aguardando aprovação.',
            'token'      => $token,
            'enrollment' => [
                'id'             => $enrollment->id,
                'status'         => $enrollment->status,
                'course'         => ['id' => $enrollment->course->id, 'title' => $enrollment->course->title],
                'unit'           => ['id' => $enrollment->unit->id, 'name' => $enrollment->unit->name],
                'shift'          => [
                    'id'          => $enrollment->shift->id,
                    'shift'       => $enrollment->shift->shift,
                    'description' => $enrollment->shift->description,
                    'start_time'  => $enrollment->shift->start_time,
                    'end_time'    => $enrollment->shift->end_time,
                ],
                'full_name'      => $enrollment->full_name,
                'cpf'            => $enrollment->cpf,
                'phone'          => $enrollment->phone,
                'created_at'     => $enrollment->created_at,
            ],
        ], 201);
    }
}
