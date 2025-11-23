<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Area;
use App\Models\DeliveryBoy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function customerReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'year' => 'nullable|integer',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $customer = Customer::with(['area', 'deliveryBoy', 'subscriptions.paper'])->findOrFail($validated['customer_id']);

        $query = Bill::where('customer_id', $validated['customer_id'])
            ->with(['items.paper']);

        if ($validated['year'] && $validated['month']) {
            $query->whereYear('bill_date', $validated['year'])
                  ->whereMonth('bill_date', $validated['month']);
        } elseif ($validated['year']) {
            $query->whereYear('bill_date', $validated['year']);
        }

        $bills = $query->orderBy('bill_date', 'desc')->get();

        $payments = Payment::where('customer_id', $validated['customer_id'])
            ->when($validated['year'] && $validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year'])
                  ->whereMonth('payment_date', $validated['month']);
            })
            ->when($validated['year'] && !$validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year']);
            })
            ->orderBy('payment_date', 'desc')
            ->get();

        $totalBilled = $bills->sum('total_amount');
        $totalPaid = $payments->sum('amount');
        $totalDue = $totalBilled - $totalPaid;

        return response()->json([
            'customer' => $customer,
            'bills' => $bills,
            'payments' => $payments,
            'summary' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_due' => $totalDue,
                'bill_count' => $bills->count(),
                'payment_count' => $payments->count(),
            ],
        ]);
    }

    public function areaReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'area_id' => 'required|exists:areas,id',
            'year' => 'nullable|integer',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $area = Area::with(['deliveryBoys'])->findOrFail($validated['area_id']);

        $customers = Customer::where('area_id', $validated['area_id'])->pluck('id');

        $query = Bill::whereIn('customer_id', $customers)
            ->with(['customer', 'items.paper']);

        if ($validated['year'] && $validated['month']) {
            $query->whereYear('bill_date', $validated['year'])
                  ->whereMonth('bill_date', $validated['month']);
        } elseif ($validated['year']) {
            $query->whereYear('bill_date', $validated['year']);
        }

        $bills = $query->orderBy('bill_date', 'desc')->get();

        $payments = Payment::whereIn('customer_id', $customers)
            ->when($validated['year'] && $validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year'])
                  ->whereMonth('payment_date', $validated['month']);
            })
            ->when($validated['year'] && !$validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year']);
            })
            ->orderBy('payment_date', 'desc')
            ->get();

        $totalBilled = $bills->sum('total_amount');
        $totalPaid = $payments->sum('amount');
        $totalDue = $totalBilled - $totalPaid;

        return response()->json([
            'area' => $area,
            'customer_count' => Customer::where('area_id', $validated['area_id'])->count(),
            'bills' => $bills,
            'payments' => $payments,
            'summary' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_due' => $totalDue,
                'bill_count' => $bills->count(),
                'payment_count' => $payments->count(),
            ],
        ]);
    }

    public function deliveryBoyReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'delivery_boy_id' => 'required|exists:delivery_boys,id',
            'year' => 'nullable|integer',
            'month' => 'nullable|integer|min:1|max:12',
        ]);

        $deliveryBoy = DeliveryBoy::with(['areas'])->findOrFail($validated['delivery_boy_id']);

        $customers = Customer::where('delivery_boy_id', $validated['delivery_boy_id'])->pluck('id');

        $query = Bill::whereIn('customer_id', $customers)
            ->with(['customer', 'items.paper']);

        if ($validated['year'] && $validated['month']) {
            $query->whereYear('bill_date', $validated['year'])
                  ->whereMonth('bill_date', $validated['month']);
        } elseif ($validated['year']) {
            $query->whereYear('bill_date', $validated['year']);
        }

        $bills = $query->orderBy('bill_date', 'desc')->get();

        $payments = Payment::whereIn('customer_id', $customers)
            ->when($validated['year'] && $validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year'])
                  ->whereMonth('payment_date', $validated['month']);
            })
            ->when($validated['year'] && !$validated['month'], function ($q) use ($validated) {
                $q->whereYear('payment_date', $validated['year']);
            })
            ->orderBy('payment_date', 'desc')
            ->get();

        $totalBilled = $bills->sum('total_amount');
        $totalPaid = $payments->sum('amount');
        $totalDue = $totalBilled - $totalPaid;

        return response()->json([
            'delivery_boy' => $deliveryBoy,
            'customer_count' => Customer::where('delivery_boy_id', $validated['delivery_boy_id'])->count(),
            'bills' => $bills,
            'payments' => $payments,
            'summary' => [
                'total_billed' => $totalBilled,
                'total_paid' => $totalPaid,
                'total_due' => $totalDue,
                'bill_count' => $bills->count(),
                'payment_count' => $payments->count(),
            ],
        ]);
    }
}

