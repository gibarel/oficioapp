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
    Schema::create('budget_items', function (Blueprint $table) {
        $table->id();
        $table->foreignId('budget_id')->constrained()->cascadeOnDelete();
        $table->string('work_name_snapshot');
        $table->string('calculation_method_used');
        $table->decimal('quantity', 10, 2);
        $table->decimal('unit_price', 12, 2);
        $table->decimal('subtotal_price', 12, 2);
        $table->json('details_snapshot'); // Trazabilidad e inmutabilidad
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budget_items');
    }
};
