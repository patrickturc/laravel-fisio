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
        Schema::table('evolutions', function (Blueprint $table) {
            $table->foreign(['agendamento_id'], 'evolutions_agendamento_id_fkey')->references(['id'])->on('appointments')->onUpdate('no action')->onDelete('set null');
            $table->foreign(['paciente_id'], 'evolutions_paciente_id_fkey')->references(['id'])->on('patients')->onUpdate('no action')->onDelete('cascade');
            $table->foreign(['profissional_id'], 'evolutions_profissional_id_fkey')->references(['id'])->on('users')->onUpdate('no action')->onDelete('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evolutions', function (Blueprint $table) {
            $table->dropForeign('evolutions_agendamento_id_fkey');
            $table->dropForeign('evolutions_paciente_id_fkey');
            $table->dropForeign('evolutions_profissional_id_fkey');
        });
    }
};
