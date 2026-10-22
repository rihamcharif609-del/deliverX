<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tracking_code')->unique();
            $table->string('pickup_address');
            $table->string('pickup_contact_name')->nullable();
            $table->string('pickup_contact_phone', 30)->nullable();
            $table->string('delivery_address');
            $table->string('recipient_name');
            $table->string('recipient_phone', 30);
            $table->text('package_description')->nullable();
            $table->decimal('package_weight', 8, 2)->nullable();
            $table->date('delivery_date')->nullable();
            $table->string('delivery_time', 30)->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('commission', 10, 2)->default(0);
            $table->string('status', 30)->default('waiting-courier');
            $table->string('payment_status', 30)->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'courier_id']);
            $table->index(['sender_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
