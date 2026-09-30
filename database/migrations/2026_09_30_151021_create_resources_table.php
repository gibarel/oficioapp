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
    Schema::create('resources', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
        $table->enum('type', ['material', 'labor', 'asset', 'service', 'extra']);
        $table->string('name');
        $table->string('use_unit');
        $table->decimal('unit_value', 12, 2);
        $table->string('purchase_unit')->nullable();
        $table->decimal('conversion_factor', 10, 4)->default(1.0000);
        
        // Amortización de Bienes/Herramientas propias (Capítulo 02 / 05)
        $table->decimal('acquisition_cost', 12, 2)->nullable();
        $table->integer('useful_life_months')->nullable();
        $table->integer('estimated_monthly_use_hours')->nullable();
        $table->decimal('hourly_depreciation_rate', 12, 2)->nullable();

        $table->boolean('is_sponsored')->default(false);
        $table->timestamps();

        $table->index(['is_sponsored', 'type']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
