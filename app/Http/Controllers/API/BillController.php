<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Subscription;
use App\Services\BillingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Bill::with(['customer', 'items.paper']);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('bill_date', 'desc')->get();
        return response()->json($bills);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();
            
            $bill = $this->billingService->generateBill(
                $validated['customer_id'],
                $validated['period_start'],
                $validated['period_end'],
                $validated['notes'] ?? null
            );

            DB::commit();
            
            $bill->load(['customer', 'items.paper']);
            return response()->json($bill, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show(Bill $bill): JsonResponse
    {
        $bill->load(['customer', 'items.paper', 'payments']);
        return response()->json($bill);
    }

    public function update(Request $request, Bill $bill): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $bill->update($validated);
        $bill->load(['customer', 'items.paper']);
        return response()->json($bill);
    }

    public function destroy(Bill $bill): JsonResponse
    {
        $bill->delete();
        return response()->json(['message' => 'Bill deleted successfully']);
    }

    public function generateMonthlyBills(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $validated['year'];
        $month = $validated['month'];
        
        $periodStart = date("{$year}-{$month}-01");
        $periodEnd = date("{$year}-{$month}-t", strtotime($periodStart));

        $customers = Customer::where('is_active', true)->get();
        $generated = [];

        try {
            DB::beginTransaction();

            foreach ($customers as $customer) {
                $bill = $this->billingService->generateBill(
                    $customer->id,
                    $periodStart,
                    $periodEnd
                );
                $generated[] = $bill;
            }

            DB::commit();
            return response()->json([
                'message' => 'Bills generated successfully',
                'count' => count($generated),
                'bills' => $generated
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}

