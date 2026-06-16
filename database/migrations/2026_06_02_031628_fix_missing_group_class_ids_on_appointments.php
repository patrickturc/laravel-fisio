<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Uses the query builder (not Eloquent models) so it stays independent of
     * model-level changes such as global scopes introduced later.
     */
    public function up(): void
    {
        $groups = DB::table('group_classes')->get();
        foreach ($groups as $g) {
            DB::table('appointments')
                ->where('type', 'group')
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
