<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->is_main) {
            abort(403, 'Acesso negado. Apenas o administrador principal pode gerenciar a equipe.');
        }

        $admins = User::where('type_user', 'A')
            ->where('id', '!=', $request->user()->id)
            ->latest()
            ->get();

        return Inertia::render('admins/index', [
            'admins' => $admins,
            'status' => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        if (!$request->user()->is_main) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type_user' => 'A',
            'is_main' => false,
            'active' => true,
        ]);

        return back()->with('status', 'Novo administrador cadastrado com sucesso!');
    }

    public function toggleStatus(Request $request, User $user)
    {
        if (!$request->user()->is_main || $user->is_main) {
            abort(403, 'Você não tem permissão para alterar o status deste usuário.');
        }

        $user->update([
            'active' => !$user->active
        ]);

        $statusMsg = $user->active ? 'ativado' : 'inativado';

        return back()->with('status', "O administrador {$user->name} foi {$statusMsg}!");
    }
}
