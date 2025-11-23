<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\PaperController;
use App\Http\Controllers\API\AreaController;
use App\Http\Controllers\API\DeliveryBoyController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\SubscriptionController;
use App\Http\Controllers\API\BillController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\ReportController;

Route::middleware('api')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Papers
    Route::apiResource('papers', PaperController::class);

    // Areas
    Route::apiResource('areas', AreaController::class);
    Route::post('areas/{area}/assign-delivery-boy', [AreaController::class, 'assignDeliveryBoy']);

    // Delivery Boys
    Route::apiResource('delivery-boys', DeliveryBoyController::class);

    // Customers
    Route::apiResource('customers', CustomerController::class);

    // Subscriptions
    Route::apiResource('subscriptions', SubscriptionController::class);

    // Bills
    Route::apiResource('bills', BillController::class);
    Route::post('bills/generate-monthly', [BillController::class, 'generateMonthlyBills']);

    // Payments
    Route::apiResource('payments', PaymentController::class);

    // Reports
    Route::get('reports/customer', [ReportController::class, 'customerReport']);
    Route::get('reports/area', [ReportController::class, 'areaReport']);
    Route::get('reports/delivery-boy', [ReportController::class, 'deliveryBoyReport']);
});

