<?php

namespace App\Http\Controllers\Api\Sender;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'message' => 'Sender dashboard endpoint ready.',
            'scope' => 'sender',
        ]);
    }
}
