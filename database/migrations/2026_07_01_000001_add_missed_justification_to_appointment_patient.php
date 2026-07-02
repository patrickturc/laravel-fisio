<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Track whether a "missed" attendance was justified. An unjustified miss
     * counts against the patient's monthly session allowance (consumes a class);
     * a justified miss does not, leaving room for a free make-up. The reason is
     * recorded for justified misses.
     */
    public function up(): void
    {
        Schema::table('appointment_patient', function (Blueprint $table) {
            $table->boolean('missed_justified')->nullable()->after('status');
            $table->text('missed_reason')->nullable()->after('missed_justified');
        });
    }

    public function down(): void
    {
        Schema::table('appointment_patient', function (Blueprint $table) {
            $table->dropColumn(['missed_justified', 'missed_reason']);
        });
    }
};
