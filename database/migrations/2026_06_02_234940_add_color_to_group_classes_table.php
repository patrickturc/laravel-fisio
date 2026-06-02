<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_classes', function (Blueprint $table) {
            $table->string('color', 7)->default('#8b5cf6')->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('group_classes', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
