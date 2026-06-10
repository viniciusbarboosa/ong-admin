<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journey;

class JourneyController extends Controller
{
    public function index()
    {
        $journeys = Journey::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($j) => [
                'id'          => $j->id,
                'year'        => $j->year,
                'title'       => $j->title,
                'description' => $j->description,
            ]);

        return response()->json($journeys);
    }
}
