<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;
use Inertia\Inertia;

class DonationAdminController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status');

        $donations = Donation::with('user')
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('donations/index', [
            'donations' => $donations,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }
}
