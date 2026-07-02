<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Weekly session frequency for a plan (e.g. "2x per week"). The monthly
     * allowance is derived from this. Null = no weekly limit (truly unlimited).
     */
    public function up(): void
    {
        Schema::table('commercial_plans', function (Blueprint $table) {
            $table->unsignedTinyInteger('sessions_per_week')->nullable()->after('sessions_total');
        });
    }

    public function down(): void
    {
        Schema::table('commercial_plans', function (Blueprint $table) {
            $table->dropColumn('sessions_per_week');
        });
    }
};
