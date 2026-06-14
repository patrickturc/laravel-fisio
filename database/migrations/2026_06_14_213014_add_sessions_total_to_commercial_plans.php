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
        Schema::table('commercial_plans', function (Blueprint $table) {
            // Sessions included for the whole membership duration.
            // Null means unlimited (e.g. open/monthly-unlimited plans).
            $table->integer('sessions_total')->nullable()->after('duration_months');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commercial_plans', function (Blueprint $table) {
            $table->dropColumn('sessions_total');
        });
    }
};
