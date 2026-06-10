<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;

class ContactController extends Controller
{
    public function index()
    {
        $contact = Contact::where('active', true)->first();

        if (!$contact) {
            return response()->json(null);
        }

        return response()->json([
            'id'           => $contact->id,
            'email'        => $contact->email,
            'phone'        => $contact->phone,
            'cnpj'         => $contact->cnpj,
            'address'      => $contact->address,
            'neighborhood' => $contact->neighborhood,
            'city'         => $contact->city,
            'state'        => $contact->state,
            'zip_code'     => $contact->zip_code,
            'website'      => $contact->website,
        ]);
    }
}
