<?php

namespace App\Http\Controllers;

use App\Models\Journey;
use Inertia\Inertia;
use Illuminate\Http\Request;

class JourneyAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('journeys/index', [
            'journeys' => Journey::orderBy('sort_order')->orderBy('created_at', 'desc')->paginate(15),
            'status'   => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'year'       => 'required|string|max:20',
            'title'      => 'required|string|max:255',
            'description'=> 'required|string',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        Journey::create($validated);

        return redirect()->route('jornada.index')->with('status', 'Marco criado com sucesso.');
    }

    public function update(Request $request, Journey $journey)
    {
        $validated = $request->validate([
            'year'       => 'required|string|max:20',
            'title'      => 'required|string|max:255',
            'description'=> 'required|string',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $journey->update($validated);

        return redirect()->route('jornada.index')->with('status', 'Marco atualizado com sucesso.');
    }

    public function destroy(Journey $journey)
    {
        $journey->delete();

        return back()->with('status', 'Marco removido com sucesso.');
    }
}
