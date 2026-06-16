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
        Schema::table('group_classes', function (Blueprint $table) {
            // Soft delete so removing a class never orphans its appointments
            // (the FK stays intact instead of being nulled).
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('group_classes', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
