<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Unit;
use Inertia\Inertia;

class UnitController extends Controller
{
    public function index()
    {
        return Inertia::render('units/index', [
            'units' => Unit::orderBy('name')->paginate(15)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'address'      => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:20',
            'active'       => 'boolean',
        ]);

        Unit::create($validated);

        return redirect()->route('unidades.index')->with('success', 'Unidade criada com sucesso.');
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'address'      => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:20',
            'active'       => 'boolean',
        ]);

        $unit->update($validated);

        return redirect()->route('unidades.index')->with('success', 'Unidade atualizada.');
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();
        return back()->with('success', 'Unidade removida.');
    }
}
