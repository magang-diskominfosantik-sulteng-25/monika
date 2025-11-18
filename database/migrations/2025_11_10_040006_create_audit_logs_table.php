<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');                    // contoh: create, update, validate, lock, unlock, import
            $table->string('entity');                    // nama tabel/entitas: achievements, targets, dll.
            $table->string('entity_id');                 // simpan sebagai string agar fleksibel
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->text('reason')->nullable();
            $table->timestamps();

            $table->index(['entity', 'entity_id']);
            $table->index(['action']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('audit_logs');
    }
};
