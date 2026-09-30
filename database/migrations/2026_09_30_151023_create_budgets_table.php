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
    Schema::create('budgets', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->string('budget_number');
        $table->string('client_name');
        $table->string('client_phone')->nullable();
        $table->string('client_address')->nullable();
        $table->string('currency', 3)->default('ARS');
        $table->decimal('subtotal_cost', 12, 2);
        $table->decimal('contingency_amount', 12, 2);
        $table->decimal('profit_amount', 12, 2);
        $table->decimal('total_price', 12, 2);
        $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'completed'])->default('draft');
        $table->text('execution_conditions')->nullable();
        $table->timestamp('issued_at')->nullable();
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
