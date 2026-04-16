<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('type_user', '!=', 'A')
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('users/index', [
            'users'  => $users,
            'status' => session('status'),
        ]);
    }

    public function toggleStatus(Request $request, User $user)
    {
        if ($user->type_user === 'A') {
            abort(403, 'Use a tela de Administradores para gerenciar admins.');
        }

        $user->update(['active' => !$user->active]);

        $statusMsg = $user->active ? 'ativado' : 'inativado';

        return back()->with('status', "O usuário {$user->name} foi {$statusMsg}!");
    }
}
