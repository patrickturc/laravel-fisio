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
            // Which recurring schedule slot generated this appointment, so
            // rescheduling can match the exact slot instead of guessing by
            // weekday/time strings. Null for ad-hoc / individual appointments.
            $table->foreignUuid('schedule_id')->nullable()->after('group_class_id')
                ->constrained('group_class_schedules')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
            $table->dropColumn('schedule_id');
        });
    }
};
