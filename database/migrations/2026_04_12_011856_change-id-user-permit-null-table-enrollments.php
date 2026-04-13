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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'course_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->change();
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('user_id');
            $table->string('cpf')->nullable()->after('full_name');
            $table->string('phone')->nullable()->after('cpf');

            $table->index(['user_id', 'course_id']);
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);

            $table->dropColumn(['full_name', 'cpf', 'phone']);

            $table->dropIndex(['user_id', 'course_id']);

            $table->foreignId('user_id')->nullable(false)->change();

            $table->unique(['user_id', 'course_id']);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
