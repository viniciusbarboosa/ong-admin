<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pillar;
use Inertia\Inertia;

class PillarAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('pillars/index', [
            'pillars' => Pillar::orderBy('sort_order')->orderBy('created_at', 'desc')->paginate(15),
            'status'  => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'icon'       => 'required|string|max:50',
            'title'      => 'required|string|max:255',
            'text'       => 'required|string',
            'background' => 'nullable|string|max:50',
            'border'     => 'nullable|string|max:50',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        Pillar::create($validated);

        return redirect()->route('pilares.index')->with('status', 'Pilar criado com sucesso.');
    }

    public function update(Request $request, Pillar $pillar)
    {
        $validated = $request->validate([
            'icon'       => 'required|string|max:50',
            'title'      => 'required|string|max:255',
            'text'       => 'required|string',
            'background' => 'nullable|string|max:50',
            'border'     => 'nullable|string|max:50',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $pillar->update($validated);

        return redirect()->route('pilares.index')->with('status', 'Pilar atualizado com sucesso.');
    }

    public function destroy(Pillar $pillar)
    {
        $pillar->delete();

        return back()->with('status', 'Pilar removido com sucesso.');
    }
}
