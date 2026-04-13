<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentAdminController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DonationAdminController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

//VERSION WEB APP
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/cursos', [CourseController::class, 'index'])->name('cursos');
    Route::post('/cursos', [CourseController::class, 'store'])->name('cursos.store');
    Route::put('/cursos/{course}', [CourseController::class, 'update'])->name('cursos.update');
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
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
