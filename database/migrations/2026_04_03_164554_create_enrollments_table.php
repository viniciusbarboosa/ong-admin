<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');

            // Status:pending, accepted, rejected
            $table->string('status')->default('pending');

            //guard the way. LINK TO php artisan storage:link
            $table->string('rg_front_path')->nullable();
            $table->string('rg_back_path')->nullable();

            $table->timestamps();

            //Ensure that the user does not enroll in the same course twice
            $table->unique(['user_id', 'course_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
