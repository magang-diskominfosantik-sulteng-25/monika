<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('indicator_id')->constrained('indicator_masters')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('opd_id')->constrained('opds')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('period_id')->constrained('periods')->cascadeOnUpdate()->restrictOnDelete();

            // Realisasi: numeric atau text
            $table->decimal('nilai_realisasi_num', 20, 4)->nullable();
            $table->text('nilai_realisasi_text')->nullable();

            $table->text('catatan')->nullable();
            $table->enum('status', ['draft','valid','locked'])->default('draft');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();

            $table->foreignId('locked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('locked_at')->nullable();

            $table->timestamps();

            $table->unique(['indicator_id', 'opd_id', 'period_id'], 'achievements_unique_triplet');
            $table->index(['status', 'opd_id', 'period_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('achievements');
    }
};
