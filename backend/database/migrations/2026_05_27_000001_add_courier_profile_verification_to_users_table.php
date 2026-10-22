<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('address')->nullable()->after('phone');
            $table->string('vehicle_type')->nullable()->after('address');
            $table->string('vehicle_number')->nullable()->after('vehicle_type');
            $table->string('cin_number')->nullable()->after('vehicle_number');
            $table->string('driver_license')->nullable()->after('cin_number');
            $table->longText('profile_photo')->nullable()->after('driver_license');
            $table->string('verification_status', 20)->default('draft')->after('profile_photo');
            $table->json('cin_image')->nullable()->after('verification_status');
            $table->json('license_image')->nullable()->after('cin_image');
            $table->json('vehicle_image')->nullable()->after('license_image');
            $table->timestamp('verification_submitted_at')->nullable()->after('vehicle_image');
            $table->timestamp('verification_reviewed_at')->nullable()->after('verification_submitted_at');
            $table->text('verification_rejection_reason')->nullable()->after('verification_reviewed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address',
                'vehicle_type',
                'vehicle_number',
                'cin_number',
                'driver_license',
                'profile_photo',
                'verification_status',
                'cin_image',
                'license_image',
                'vehicle_image',
                'verification_submitted_at',
                'verification_reviewed_at',
                'verification_rejection_reason',
            ]);
        });
    }
};
