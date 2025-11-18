<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained('indicator_masters')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('opd_id')->constrained('opds')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('period_id')->constrained('periods')->cascadeOnUpdate()->restrictOnDelete();

            // Sediakan numeric & text; aplikasi pakai salah satu tergantung indicator_type
            $table->decimal('nilai_target_num', 20, 4)->nullable();
            $table->text('nilai_target_text')->nullable();
            $table->text('catatan')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Hindari duplikasi target pada kombinasi ini
            $table->unique(['indicator_id', 'opd_id', 'period_id'], 'targets_unique_triplet');
            $table->index(['opd_id', 'period_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('targets');
    }
};
