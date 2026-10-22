<?php

use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourierProfileController;
use App\Http\Controllers\Api\Courier\DashboardController as CourierDashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\Sender\DashboardController as SenderDashboardController;
use App\Http\Controllers\Api\WithdrawalController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'service' => 'deliverx-api',
        'timestamp' => now()->toIso8601String(),
    ]));

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware(['auth:sanctum', 'not.suspended'])->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::patch('/profile', [AuthController::class, 'updateProfile']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    Route::middleware(['auth:sanctum', 'not.suspended'])->group(function () {
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
        Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'role:admin', 'not.suspended'])->prefix('admin')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::post('/users/{user}/suspend', [AdminUserController::class, 'suspend']);
        Route::post('/users/{user}/unsuspend', [AdminUserController::class, 'unsuspend']);
        Route::get('/withdrawals', [WithdrawalController::class, 'adminIndex']);
        Route::patch('/withdrawals/{withdrawal}', [WithdrawalController::class, 'adminDecision']);
        Route::get('/deliveries', [DeliveryController::class, 'adminIndex']);
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
        Route::match(['put', 'patch'], '/deliveries/{delivery}', [DeliveryController::class, 'update']);
        Route::delete('/deliveries/{delivery}', [DeliveryController::class, 'destroy']);
        Route::get('/couriers/verification', [CourierProfileController::class, 'adminIndex']);
        Route::patch('/couriers/{courier}/verification', [CourierProfileController::class, 'adminDecision']);
    });

    Route::middleware(['auth:sanctum', 'role:sender', 'not.suspended'])->prefix('sender')->group(function () {
        Route::get('/dashboard', SenderDashboardController::class);
        Route::get('/deliveries', [DeliveryController::class, 'senderIndex']);
        Route::post('/deliveries', [DeliveryController::class, 'store']);
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
        Route::post('/deliveries/{delivery}/pay', [DeliveryController::class, 'pay']);
        Route::post('/deliveries/{delivery}/rating', [RatingController::class, 'store']);
        Route::match(['put', 'patch'], '/deliveries/{delivery}', [DeliveryController::class, 'update']);
        Route::delete('/deliveries/{delivery}', [DeliveryController::class, 'destroy']);
    });

    Route::middleware(['auth:sanctum', 'role:courier', 'not.suspended'])->prefix('courier')->group(function () {
        Route::get('/dashboard', CourierDashboardController::class);
        Route::get('/deliveries', [DeliveryController::class, 'courierIndex']);
        Route::get('/deliveries/available', [DeliveryController::class, 'courierAvailable']);
        Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
        Route::post('/deliveries/{delivery}/accept', [DeliveryController::class, 'accept']);
        Route::patch('/deliveries/{delivery}/status', [DeliveryController::class, 'courierStatus']);
        Route::post('/deliveries/{delivery}/confirm-otp', [DeliveryController::class, 'confirmOtp']);
        Route::get('/ratings', [RatingController::class, 'courierRatings']);
        Route::get('/wallet', [WithdrawalController::class, 'courierWallet']);
        Route::get('/withdrawals', [WithdrawalController::class, 'courierIndex']);
        Route::post('/withdrawals', [WithdrawalController::class, 'store']);
        Route::get('/profile', [CourierProfileController::class, 'show']);
        Route::patch('/profile', [CourierProfileController::class, 'update']);
        Route::post('/profile/documents/{document}', [CourierProfileController::class, 'document']);
        Route::post('/profile/submit-verification', [CourierProfileController::class, 'submit']);
    });
});
