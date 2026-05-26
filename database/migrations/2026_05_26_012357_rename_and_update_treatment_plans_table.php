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
        // 1. Drop the foreign key for patient_id before dropping the column or renaming table
        // The foreign key name is usually treatment_plans_patient_id_foreign
        Schema::table('treatment_plans', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
        });

        // 2. Rename the table
        Schema::rename('treatment_plans', 'clinical_protocols');

        // 3. Alter columns
        Schema::table('clinical_protocols', function (Blueprint $table) {
            $table->dropColumn(['patient_id', 'completed_sessions', 'status', 'start_date', 'end_date']);
            $table->renameColumn('title', 'name');
            $table->renameColumn('objective', 'description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinical_protocols', function (Blueprint $table) {
            $table->renameColumn('name', 'title');
            $table->renameColumn('description', 'objective');
            $table->foreignUuid('patient_id')->nullable()->constrained('patients')->cascadeOnDelete();
            $table->integer('completed_sessions')->default(0);
            $table->string('status')->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });

        Schema::rename('clinical_protocols', 'treatment_plans');
    }
};
