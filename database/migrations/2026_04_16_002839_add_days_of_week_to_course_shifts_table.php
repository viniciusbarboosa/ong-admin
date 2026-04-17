<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_shifts', function (Blueprint $table) {
            // JSON array com os dias da semana: ["seg","ter","qua","qui","sex","sab","dom"]
            $table->json('days_of_week')->nullable()->after('end_time');
        });
    }

    public function down(): void
    {
        Schema::table('course_shifts', function (Blueprint $table) {
            $table->dropColumn('days_of_week');
        });
    }
};
