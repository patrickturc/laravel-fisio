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
            $table->dropForeign(['treatment_plan_id']);
            $table->renameColumn('treatment_plan_id', 'clinical_protocol_id');
            $table->foreign('clinical_protocol_id')->references('id')->on('clinical_protocols')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evolutions', function (Blueprint $table) {
            $table->dropForeign(['clinical_protocol_id']);
            $table->renameColumn('clinical_protocol_id', 'treatment_plan_id');
            $table->foreign('treatment_plan_id')->references('id')->on('treatment_plans')->nullOnDelete();
        });
    }
};
