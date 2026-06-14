<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Preserve audit logs even if a transaction is force-deleted: detach the
     * cascade and keep the orphaned log row (action='deleted' still records
     * who removed it).
     */
    public function up(): void
    {
        Schema::table('financial_transaction_logs', function (Blueprint $table) {
            $table->dropForeign(['financial_transaction_id']);
            $table->uuid('financial_transaction_id')->nullable()->change();
            $table->foreign('financial_transaction_id')
                ->references('id')
                ->on('financial_transactions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('financial_transaction_logs', function (Blueprint $table) {
            $table->dropForeign(['financial_transaction_id']);
            $table->uuid('financial_transaction_id')->nullable(false)->change();
            $table->foreign('financial_transaction_id')
                ->references('id')
                ->on('financial_transactions')
                ->cascadeOnDelete();
        });
    }
};
