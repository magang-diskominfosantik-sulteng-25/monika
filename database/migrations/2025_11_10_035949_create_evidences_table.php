<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achievement_id')->constrained('achievements')->cascadeOnUpdate()->cascadeOnDelete();

            $table->string('file_path')->nullable();                      // path di storage
            $table->string('file_hash', 128)->nullable();                  // integrity (opsional)
            $table->unsignedBigInteger('file_size')->nullable();           // dalam byte
            $table->string('url_eksternal')->nullable();                   // link jika tidak upload file
            $table->string('deskripsi')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['achievement_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('evidences');
    }
};
    