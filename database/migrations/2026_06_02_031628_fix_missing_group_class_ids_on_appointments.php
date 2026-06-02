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
        $groups = \App\Models\GroupClass::all();
        foreach($groups as $g) {
            \App\Models\Appointment::where('type', 'group')
                ->where('title', $g->name)
                ->whereNull('group_class_id')
                ->update(['group_class_id' => $g->id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
