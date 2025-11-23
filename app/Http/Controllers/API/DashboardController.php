<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Area;
use App\Models\DeliveryBoy;
use App\Models\Paper;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'total_customers' => Customer::where('is_active', true)->count(),
            'total_areas' => Area::where('is_active', true)->count(),
            'total_delivery_boys' => DeliveryBoy::where('is_active', true)->count(),
            'total_papers' => Paper::where('is_active', true)->count(),
            'unpaid_bills' => Bill::where('status', '!=', 'paid')->count(),
            'total_due_amount' => Bill::sum('due_amount'),
            'total_paid_amount' => Payment::sum('amount'),
            'pending_bills' => Bill::where('status', 'pending')->count(),
            'partial_bills' => Bill::where('status', 'partial')->count(),
            'paid_bills' => Bill::where('status', 'paid')->count(),
        ];

        // Recent bills
        $recentBills = Bill::with(['customer', 'items.paper'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Recent payments
        $recentPayments = Payment::with(['customer', 'bill'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_bills' => $recentBills,
            'recent_payments' => $recentPayments,
        ]);
    }
}

