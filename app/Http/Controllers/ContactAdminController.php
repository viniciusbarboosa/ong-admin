<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ContactAdminController extends Controller
{
    public function index()
    {
        $contact = Contact::first();

        return Inertia::render('contacts/index', [
            'contact' => $contact,
            'status'  => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:20',
            'cnpj'         => 'nullable|string|max:18',
            'address'      => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city'         => 'nullable|string|max:255',
            'state'        => 'nullable|string|size:2',
            'zip_code'     => 'nullable|string|max:9',
            'website'      => 'nullable|string|max:255',
            'active'       => 'boolean',
        ]);

        $contact = Contact::first();

        if ($contact) {
            $contact->update($validated);
        } else {
            $contact = Contact::create($validated);
        }

        return redirect()->route('fale-conosco.index')
            ->with('status', 'Informações de contato atualizadas com sucesso!');
    }
}
