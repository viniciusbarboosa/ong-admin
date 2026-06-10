<?php

namespace App\Http\Controllers;

use App\Models\AboutUs;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AboutUsAdminController extends Controller
{
    public function index()
    {
        $about = AboutUs::first();
        return Inertia::render('about-us/index', [
            'about'  => $about,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'active'  => 'boolean',
        ]);

        $about = AboutUs::first();
        if ($about) {
            $about->update($validated);
        } else {
            AboutUs::create($validated);
        }

        return redirect()->route('sobre-nos.index')->with('status', 'Conteúdo atualizado com sucesso.');
    }
}
