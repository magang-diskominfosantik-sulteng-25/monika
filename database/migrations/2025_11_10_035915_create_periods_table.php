<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('periods', function (Blueprint $table) {
            $table->id();
            $table->enum('frequency', ['annual','semester','quarter','month'])->default('annual');
            $table->smallInteger('tahun');
            $table->tinyInteger('quarter')->nullable(); // 1..4
            $table->tinyInteger('month')->nullable();   // 1..12
            $table->string('period_key')->unique();     // contoh: 2026, 2026-S1, 2026-Q3, 2026-05
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->index(['frequency', 'tahun']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('periods');
    }
};
