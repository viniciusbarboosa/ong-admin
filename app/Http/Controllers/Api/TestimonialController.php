<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;

class TestimonialController extends Controller
{
    /**
     * GET /api/testimonials
     * Lista depoimentos ativos para exibição no app.
     */
    public function index()
    {
        $testimonials = Testimonial::where('active', true)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($t) => [
                'id'     => $t->id,
                'name'   => $t->name,
                'role'   => $t->role,
                'text'   => $t->text,
                'avatar' => $t->avatar,
            ]);

        return response()->json($testimonials);
    }
}
