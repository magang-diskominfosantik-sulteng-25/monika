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
        Schema::table('indicator_masters', function (Blueprint $table) {
            // Drop old sumber_data column
            $table->dropColumn('sumber_data');

            // Add new opd_id foreign key column
            $table->foreignId('opd_id')->nullable()->after('satuan')->constrained('opds')->cascadeOnUpdate()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('indicator_masters', function (Blueprint $table) {
            // Drop foreign key and opd_id column
            $table->dropForeign(['opd_id']);
            $table->dropColumn('opd_id');

            // Re-add sumber_data column
            $table->string('sumber_data')->nullable()->after('satuan');
        });
    }
};
