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
        if (!Schema::hasColumn('enrollments', 'course_shift_id')) {
            Schema::table('enrollments', function (Blueprint $table) {
                $table->foreignId('course_shift_id')
                    ->nullable()
                    ->after('course_id')
                    ->constrained('course_shifts')
                    ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'course_shift_id')) {
                $table->dropForeign(['course_shift_id']);
                $table->dropColumn('course_shift_id');
            }
        });
    }
};
