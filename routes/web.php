<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentAdminController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\ContactAdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DonationAdminController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//VERSION WEB APP
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::post('dashboard/analise-ia', [DashboardController::class, 'analysisAI'])->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos');
    Route::post('/cursos', [CourseController::class, 'store'])->name('cursos.store');
    Route::post('/cursos/{course}', [CourseController::class, 'update'])->name('cursos.update');
    Route::delete('/cursos/{course}', [CourseController::class, 'destroy'])->name('cursos.destroy');
});

//ENROLLMENTS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/inscricoes', [EnrollmentAdminController::class, 'index'])->name('inscricoes.index');
    Route::patch('/inscricoes/{enrollment}/status', [EnrollmentAdminController::class, 'updateStatus'])->name('inscricoes.status');
});

//MANAGE ADMINS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/administradores', [AdminUserController::class, 'index'])->name('admins.index');
    Route::post('/administradores', [AdminUserController::class, 'store'])->name('admins.store');
    Route::patch('/administradores/{user}/status', [AdminUserController::class, 'toggleStatus'])->name('admins.status');
});

//DONATIONS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/doacoes', [DonationAdminController::class, 'index'])->name('doacoes.index');
});

//UNITS
Route::middleware(['auth'])->group(function () {
    Route::get('/unidades', [UnitController::class, 'index'])->name('unidades.index');
    Route::post('/unidades', [UnitController::class, 'store'])->name('unidades.store');
    Route::put('/unidades/{unit}', [UnitController::class, 'update'])->name('unidades.update');
    Route::delete('/unidades/{unit}', [UnitController::class, 'destroy'])->name('unidades.destroy');
});

//USERS (app users — non-admin)
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::patch('/usuarios/{user}/status', [UserController::class, 'toggleStatus'])->name('usuarios.status');
});

//TESTIMONIALS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/depoimentos', [\App\Http\Controllers\TestimonialAdminController::class, 'index'])->name('depoimentos.index');
    Route::post('/depoimentos', [\App\Http\Controllers\TestimonialAdminController::class, 'store'])->name('depoimentos.store');
    Route::put('/depoimentos/{testimonial}', [\App\Http\Controllers\TestimonialAdminController::class, 'update'])->name('depoimentos.update');
    Route::delete('/depoimentos/{testimonial}', [\App\Http\Controllers\TestimonialAdminController::class, 'destroy'])->name('depoimentos.destroy');
});

//PILLARS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pilares', [\App\Http\Controllers\PillarAdminController::class, 'index'])->name('pilares.index');
    Route::post('/pilares', [\App\Http\Controllers\PillarAdminController::class, 'store'])->name('pilares.store');
    Route::put('/pilares/{pillar}', [\App\Http\Controllers\PillarAdminController::class, 'update'])->name('pilares.update');
    Route::delete('/pilares/{pillar}', [\App\Http\Controllers\PillarAdminController::class, 'destroy'])->name('pilares.destroy');
});

//IMPACTS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/impacto', [\App\Http\Controllers\ImpactAdminController::class, 'index'])->name('impacto.index');
    Route::post('/impacto', [\App\Http\Controllers\ImpactAdminController::class, 'store'])->name('impacto.store');
    Route::put('/impacto/{impact}', [\App\Http\Controllers\ImpactAdminController::class, 'update'])->name('impacto.update');
    Route::delete('/impacto/{impact}', [\App\Http\Controllers\ImpactAdminController::class, 'destroy'])->name('impacto.destroy');
});

//JOURNEYS
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/jornada', [\App\Http\Controllers\JourneyAdminController::class, 'index'])->name('jornada.index');
    Route::post('/jornada', [\App\Http\Controllers\JourneyAdminController::class, 'store'])->name('jornada.store');
    Route::put('/jornada/{journey}', [\App\Http\Controllers\JourneyAdminController::class, 'update'])->name('jornada.update');
    Route::delete('/jornada/{journey}', [\App\Http\Controllers\JourneyAdminController::class, 'destroy'])->name('jornada.destroy');
});

//ABOUT US
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/sobre-nos', [\App\Http\Controllers\AboutUsAdminController::class, 'index'])->name('sobre-nos.index');
    Route::post('/sobre-nos', [\App\Http\Controllers\AboutUsAdminController::class, 'update'])->name('sobre-nos.update');
});

//FALE CONOSCO
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/fale-conosco', [ContactAdminController::class, 'index'])->name('fale-conosco.index');
    Route::put('/fale-conosco', [ContactAdminController::class, 'update'])->name('fale-conosco.update');
});
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
