<?php

namespace App\Http\Controllers;

use App\Models\Impact;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ImpactAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('impacts/index', [
            'impacts' => Impact::orderBy('sort_order')->orderBy('created_at', 'desc')->paginate(15),
            'status'  => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'icon'       => 'required|string|max:50',
            'metric'     => 'required|string|max:255',
            'label'      => 'required|string|max:255',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        Impact::create($validated);

        return redirect()->route('impacto.index')->with('status', 'Métrica criada com sucesso.');
    }

    public function update(Request $request, Impact $impact)
    {
        $validated = $request->validate([
            'icon'       => 'required|string|max:50',
            'metric'     => 'required|string|max:255',
            'label'      => 'required|string|max:255',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $impact->update($validated);

        return redirect()->route('impacto.index')->with('status', 'Métrica atualizada com sucesso.');
    }

    public function destroy(Impact $impact)
    {
        $impact->delete();

        return back()->with('status', 'Métrica removida com sucesso.');
    }
}
