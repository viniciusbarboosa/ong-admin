<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_shifts', function (Blueprint $table) {
            $table->string('description')->nullable()->after('shift');
            $table->string('start_time')->nullable()->after('description'); // e.g. "08:00"
            $table->string('end_time')->nullable()->after('start_time');   // e.g. "11:30"
        });
    }

    public function down(): void
    {
        Schema::table('course_shifts', function (Blueprint $table) {
            $table->dropColumn(['description', 'start_time', 'end_time']);
        });
    }
};
