<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pillar;

class PillarController extends Controller
{
    /**
     * GET /api/pillars
     * Lista pilares ativos para exibição no app.
     */
    public function index()
    {
        $pillars = Pillar::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id'         => $p->id,
                'icon'       => $p->icon,
                'title'      => $p->title,
                'text'       => $p->text,
                'background' => $p->background,
                'border'     => $p->border,
            ]);

        return response()->json($pillars);
    }
}
