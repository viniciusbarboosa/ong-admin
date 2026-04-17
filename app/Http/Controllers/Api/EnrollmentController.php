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
    /**
     * GET /api/enrollments
     * Lista as inscrições do usuário autenticado.
     */
    public function index(Request $request)
    {
        $enrollments = Enrollment::with(['course', 'unit', 'shift'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn($e) => [
                'id'         => $e->id,
                'protocolo'  => 'MPC-' . $e->created_at->year . '-' . str_pad($e->id, 5, '0', STR_PAD_LEFT),
                'status'     => $e->status,
                'course'     => $e->course ? ['id' => $e->course->id, 'title' => $e->course->title, 'description' => $e->course->description, 'workload' => $e->course->workload] : null,
                'unit'       => $e->unit   ? ['id' => $e->unit->id,   'name'  => $e->unit->name,   'address' => $e->unit->address, 'neighborhood' => $e->unit->neighborhood, 'city' => $e->unit->city, 'phone' => $e->unit->phone] : null,
                'shift'      => $e->shift  ? ['id' => $e->shift->id,  'shift' => $e->shift->shift, 'description' => $e->shift->description, 'start_time' => $e->shift->start_time, 'end_time' => $e->shift->end_time, 'max_students' => $e->shift->max_students] : null,
                'full_name'  => $e->full_name,
                'cpf'        => $e->cpf,
                'phone'      => $e->phone,
                'created_at' => $e->created_at?->toDateString(),
            ]);

        return response()->json($enrollments);
    }

    /**
     * DELETE /api/enrollments/{enrollment}
     * Cancela uma pré-inscrição pendente do usuário autenticado.
     */
    public function cancel(Request $request, Enrollment $enrollment)
    {
        // Só o dono pode cancelar
        if ($enrollment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        // Só cancela se ainda estiver pendente
        if ($enrollment->status !== 'pending') {
            return response()->json([
                'message' => 'Apenas inscrições pendentes podem ser canceladas.',
            ], 422);
        }

        $enrollment->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Inscrição cancelada com sucesso.']);
    }

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

        // Usuário autenticado ou anônimo
        $user        = $request->user();
        $isAnonymous = is_null($user);
        $token       = null;

        // Se anônimo e enviou CPF, cria/recupera uma conta mínima para vincular a inscrição
        if ($isAnonymous && $request->filled('cpf')) {
            $cpf  = preg_replace('/\D/', '', $request->cpf);

            $existingUser = User::where('cpf', $cpf)->first();

            // Se já existe uma conta real (com senha definida pelo usuário), exige login
            if ($existingUser) {
                // Verifica se a senha é a senha padrão (CPF) — conta criada automaticamente pelo app
                $isAutoAccount = Hash::check($cpf, $existingUser->password);

                if (!$isAutoAccount) {
                    // Conta com senha personalizada: o usuário deve fazer login para continuar
                    return response()->json([
                        'message' => 'Este CPF já possui uma conta. Faça login para continuar.',
                        'code'    => 'account_exists',
                    ], 409);
                }
            }

            $user = User::firstOrCreate(
                ['cpf' => $cpf],
                [
                    'name'     => $request->full_name ?? 'Usuário',
                    'email'    => $cpf . '@app.procrianca.local',
                    'password' => Hash::make($cpf),
                    'cpf'      => $cpf,
                ]
            );
            $isAnonymous = false;
            $token = $user->createToken('mobile')->plainTextToken;
        }

        // Valida se a unidade oferece este curso
        $course = Course::findOrFail($request->course_id);
        $unitOffersCourse = $course->units()->where('unit_id', $request->unit_id)->exists();
        if (!$unitOffersCourse) {
            return response()->json(['message' => 'Esta unidade não oferece este curso.'], 422);
        }

        $shift = CourseShift::where('id', $validated['course_shift_id'])
                    ->where('course_id', $validated['course_id'])
                    ->first();

        if (!$shift) {
            return response()->json(['message' => 'Turno inválido para este curso.'], 400);
        }

        // Check vacancies
        $acceptedCount = Enrollment::where('course_shift_id', $shift->id)
                            ->where('status', 'accepted')
                            ->count();

        if ($acceptedCount >= $shift->max_students) {
            return response()->json(['message' => 'Este turno já está lotado.'], 400);
        }

        // Verifica inscrição duplicada (apenas para usuários autenticados)
        // Inscrições canceladas não contam — o usuário pode se re-inscrever
        if (!$isAnonymous) {
            $exists = Enrollment::where('user_id', $user->id)
                        ->where('course_id', $validated['course_id'])
                        ->whereNotIn('status', ['cancelled'])
                        ->exists();
            if ($exists) {
                return response()->json(['message' => 'Você já está inscrito neste curso.'], 400);
            }
        }

        // Verifica conflito de horário/dias com outras inscrições ativas do usuário
        if (!$isAnonymous) {
            $activeEnrollments = Enrollment::where('user_id', $user->id)
                ->whereNotIn('status', ['cancelled', 'rejected'])
                ->where('course_id', '!=', $validated['course_id'])
                ->with('shift.course')
                ->get();

            foreach ($activeEnrollments as $enrollment) {
                $existing = $enrollment->shift;
                if (!$existing) continue;

                $newDays      = $shift->days_of_week ?? [];
                $existingDays = $existing->days_of_week ?? [];

                // Determina se há sobreposição de dias
                if (!empty($newDays) && !empty($existingDays)) {
                    $sharedDays = array_intersect($newDays, $existingDays);
                    if (empty($sharedDays)) continue; // dias diferentes: sem conflito
                } else {
                    // Sem dias configurados: compara apenas o período
                    if ($shift->shift !== $existing->shift) continue;
                }

                // Verifica sobreposição de horário (se ambos tiverem horários definidos)
                if ($shift->start_time && $shift->end_time && $existing->start_time && $existing->end_time) {
                    $newStart  = strtotime($shift->start_time);
                    $newEnd    = strtotime($shift->end_time);
                    $exStart   = strtotime($existing->start_time);
                    $exEnd     = strtotime($existing->end_time);

                    $overlaps = $newStart < $exEnd && $newEnd > $exStart;
                    if (!$overlaps) continue;
                }
                // Se chegou aqui: mesmos dias (ou mesmo período) e horários sobrepostos (ou sem horário para diferenciar)

                return response()->json([
                    'message' => 'Conflito de horário com outra inscrição ativa ('
                        . ($existing->course->title ?? 'outro curso')
                        . ').',
                ], 422);
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
            'unit_id'         => $request->unit_id ?? null,
            'course_shift_id' => $validated['course_shift_id'],
            'status'          => 'pending',
            'rg_front_path'   => $rgFrontPath,
            'rg_back_path'    => $rgBackPath,
            'is_anonymous'    => $isAnonymous,
            // Se autenticado e o campo não veio no payload, usa os dados do User
            'full_name'       => $request->full_name ?? $user?->name ?? null,
            'cpf'             => $request->cpf       ?? $user?->cpf  ?? null,
            'phone'           => $request->phone     ?? $user?->phone ?? null,
        ]);

        $enrollment->load(['course', 'unit', 'shift']);

        return response()->json([
            'message'      => 'Pré-inscrição enviada com sucesso. Aguardando aprovação.',
            'access_token' => $token,
            'enrollment'   => [
                'id'             => $enrollment->id,
                'status'         => $enrollment->status,
                'course'         => ['id' => $enrollment->course->id, 'title' => $enrollment->course->title],
                'unit'           => $enrollment->unit
                    ? ['id' => $enrollment->unit->id, 'name' => $enrollment->unit->name]
                    : null,
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
