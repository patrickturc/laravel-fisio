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
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign(['patient_id'], 'appointments_patient_id_fkey')->references(['id'])->on('patients')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['user_id'], 'appointments_user_id_fkey')->references(['id'])->on('users')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign('appointments_patient_id_fkey');
            $table->dropForeign('appointments_user_id_fkey');
        });
    }
};
