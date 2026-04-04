<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'message' => 'nullable|string|max:500',
            'status' => 'nullable|string',        
            'transaction_id' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $donation = Donation::create($validated);

        return response()->json([
            'message' => 'Doação registrada com sucesso!',
            'donation' => $donation,
        ], 201);
    }

    public function index(Request $request)
    {
        return response()->json(
            Donation::where('user_id', $request->user()->id)->latest()->get()
        );
    }
}
