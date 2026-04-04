<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Donation;
use Inertia\Inertia;

class DonationAdminController extends Controller
{
    public function index()
    {
        $donations = Donation::with('user')
            ->latest()
            ->paginate(15);

        return Inertia::render('donations/index', [
            'donations' => $donations
        ]);
    }
}
