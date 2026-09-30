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
    Schema::create('work_resource', function (Blueprint $table) {
        $table->id();
        $table->foreignId('work_id')->constrained()->cascadeOnDelete();
        $table->foreignId('resource_id')->constrained()->restrictOnDelete();
        $table->decimal('quantity', 10, 3);
        $table->decimal('custom_unit_value', 12, 2)->nullable();
        // Asignación de indirectos / servicios
        $table->enum('allocation_type', ['direct', 'hourly_rate', 'percentage_share', 'fixed_estimate'])->default('direct');
        $table->decimal('allocation_value', 12, 2)->nullable();
        $table->boolean('is_client_provided')->default(false);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_resource');
    }
};
