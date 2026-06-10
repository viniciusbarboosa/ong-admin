<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AboutUs;
use Illuminate\Support\Facades\Storage;

class AboutUsController extends Controller
{
    public function index()
    {
        $about = AboutUs::where('active', true)->first();

        return response()->json($about ? [
            'id'      => $about->id,
            'content' => $about->content,
            'image'   => $about->image ? url(Storage::url($about->image)) : null,
        ] : null);
    }
}
