<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CourseController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//VERSION WEB APP
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos');
    Route::post('/cursos', [CourseController::class, 'store'])->name('cursos.store');
    Route::put('/cursos/{course}', [CourseController::class, 'update'])->name('cursos.update');
    Route::delete('/cursos/{course}', [CourseController::class, 'destroy'])->name('cursos.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
