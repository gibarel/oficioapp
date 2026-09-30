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
    Schema::create('works', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('name');
        $table->enum('calculation_method', ['simple', 'intermediate', 'advanced'])->default('simple');
        $table->string('reference_unit');
        $table->decimal('base_price', 12, 2)->nullable();
        $table->decimal('contingency_percentage', 5, 2)->default(0.00);
        $table->decimal('profit_margin_percentage', 5, 2)->default(0.00);
        $table->text('notes')->nullable();
        $table->boolean('is_template')->default(false);
        $table->timestamps();

        $table->index(['user_id', 'name']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('works');
    }
};
