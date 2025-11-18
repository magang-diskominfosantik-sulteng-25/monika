<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('opds', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('singkatan', 50)->nullable();
            $table->string('kontak_nama')->nullable();
            $table->string('kontak_hp', 30)->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['aktif', 'nama']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('opds');
    }
};
