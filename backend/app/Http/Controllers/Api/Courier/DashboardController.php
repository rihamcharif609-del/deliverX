<?php

namespace App\Http\Controllers\Api\Courier;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\WithdrawalController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'ratings' => RatingController::courierRatingSummary($request->user()),
                'wallet' => app(WithdrawalController::class)->walletSummary($request->user()),
            ],
        ]);
    }
}
