<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Impact;

class ImpactController extends Controller
{
    public function index()
    {
        $impacts = Impact::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($i) => [
                'id'     => $i->id,
                'icon'   => $i->icon,
                'metric' => $i->metric,
                'label'  => $i->label,
            ]);

        return response()->json($impacts);
    }
}
