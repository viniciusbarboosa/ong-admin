<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\CourseApiController;

Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [ApiAuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/donations', [DonationController::class, 'store']);
    Route::get('/donations', [DonationController::class, 'index']);
});

// Inscrição — aceita autenticado OU anônimo (o controller detecta via $request->user())
Route::post('/enroll', [EnrollmentController::class, 'enroll']);

// Doações anônimas
Route::post('/donations/anonymous', [DonationController::class, 'storeAnonymous'])
    ->name('donations.anonymous');

// ─── Rotas públicas para o app (pré-inscrição) ────────────────────────────────

// 1. Lista todos os cursos com turnos
Route::get('/courses', [CourseApiController::class, 'index']);

// 2. Lista as unidades que oferecem um curso específico
Route::get('/courses/{course}/units', [CourseApiController::class, 'units']);

// 3. Lista os turnos de um curso em uma unidade específica
Route::get('/courses/{course}/units/{unit}/shifts', [CourseApiController::class, 'shifts']);
