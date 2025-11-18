<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('indicator_masters', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->enum('jenis', ['IKU','IKD','IKK']);           // kategori indikator
            $table->enum('indicator_type', ['numeric','percent','index','text'])->default('numeric');
            $table->string('satuan')->nullable();
            $table->string('sumber_data')->nullable();
            $table->enum('frequency', ['annual','semester','quarter','month'])->default('annual');
            $table->text('keterangan')->nullable();
            $table->unsignedInteger('version')->default(1);
            $table->boolean('aktif')->default(true);
            $table->timestamps();

            $table->index(['jenis', 'frequency', 'aktif']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('indicator_masters');
    }
};
