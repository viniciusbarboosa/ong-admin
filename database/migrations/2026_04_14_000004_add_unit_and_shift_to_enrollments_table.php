<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            if (!Schema::hasColumn('enrollments', 'unit_id')) {
                $table->foreignId('unit_id')
                    ->nullable()
                    ->after('course_id')
                    ->constrained('units')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('enrollments', 'course_shift_id')) {
                $table->foreignId('course_shift_id')
                    ->nullable()
                    ->after('unit_id')
                    ->constrained('course_shifts')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            //$table->dropForeign(['unit_id']);
            //$table->dropForeign(['course_shift_id']);
            //$table->dropColumn(['unit_id', 'course_shift_id']);
        });
    }
};
