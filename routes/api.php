<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\CourseShiftController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\CourseApiController;

Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [ApiAuthController::class, 'updateProfile']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/donations', [DonationController::class, 'store']);
    Route::get('/donations', [DonationController::class, 'index']);
});

// Inscrição — aceita autenticado OU anônimo (o controller detecta via $request->user())
Route::post('/enroll', [EnrollmentController::class, 'enroll']);

// Inscrições do usuário autenticado
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/enrollments', [EnrollmentController::class, 'index']);
    Route::delete('/enrollments/{enrollment}', [EnrollmentController::class, 'cancel']);
});

//ANONYMOUS DONATIONS
Route::post('/donations/anonymous', [DonationController::class, 'storeAnonymous'])->name
('donations.anonymous');

Route::get('courses/{course}/shifts', [CourseShiftController::class, 'index']);

// Rotas usadas pelo app mobile
Route::get('/courses', [CourseApiController::class, 'index']);
Route::get('/courses/{course}/units', [CourseApiController::class, 'units']);
Route::get('/courses/{course}/units/{unit}/shifts', [CourseApiController::class, 'shifts']);
