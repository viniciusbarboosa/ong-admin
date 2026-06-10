<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Testimonial;
use Inertia\Inertia;

class TestimonialAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('testimonials/index', [
            'testimonials' => Testimonial::orderBy('sort_order')->orderBy('created_at', 'desc')->paginate(15),
            'status'       => session('status'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'nullable|string|max:255',
            'text'       => 'required|string',
            'avatar'     => 'nullable|string|max:50',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        Testimonial::create($validated);

        return redirect()->route('depoimentos.index')->with('status', 'Depoimento criado com sucesso.');
    }

    public function update(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'nullable|string|max:255',
            'text'       => 'required|string',
            'avatar'     => 'nullable|string|max:50',
            'active'     => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $testimonial->update($validated);

        return redirect()->route('depoimentos.index')->with('status', 'Depoimento atualizado com sucesso.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();

        return back()->with('status', 'Depoimento removido com sucesso.');
    }
}
