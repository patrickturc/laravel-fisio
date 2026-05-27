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
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->foreignUuid('membership_id')->nullable()->constrained('memberships')->nullOnDelete();
            $table->foreignUuid('recurring_expense_id')->nullable()->constrained('recurring_expenses')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('membership_id');
            $table->dropConstrainedForeignId('recurring_expense_id');
        });
    }
};
