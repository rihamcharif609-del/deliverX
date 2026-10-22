<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->string('delivery_otp', 4)->nullable()->after('payment_status');
            $table->string('payment_card_holder')->nullable()->after('delivery_otp');
            $table->timestamp('paid_at')->nullable()->after('payment_card_holder');
        });
    }

    public function down(): void
    {
        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'delivery_otp',
                'payment_card_holder',
                'paid_at',
            ]);
        });
    }
};
