<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with(['customer', 'bill']);

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->has('bill_id')) {
            $query->where('bill_id', $request->bill_id);
        }

        $payments = $query->orderBy('payment_date', 'desc')->get();
        return response()->json($payments);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'bill_id' => 'nullable|exists:bills,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Generate payment number
            $paymentNumber = 'PAY-' . strtoupper(Str::random(8));

            $payment = Payment::create([
                'customer_id' => $validated['customer_id'],
                'bill_id' => $validated['bill_id'] ?? null,
                'payment_number' => $paymentNumber,
                'payment_date' => $validated['payment_date'],
                'amount' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Update bill if payment is linked to a bill
            if ($validated['bill_id']) {
                $bill = Bill::findOrFail($validated['bill_id']);
                $newPaidAmount = $bill->paid_amount + $validated['amount'];
                $newDueAmount = max(0, $bill->total_amount - $newPaidAmount);
                
                $status = 'paid';
                if ($newDueAmount > 0) {
                    $status = $newPaidAmount > 0 ? 'partial' : 'pending';
                }

                $bill->update([
                    'paid_amount' => $newPaidAmount,
                    'due_amount' => $newDueAmount,
                    'status' => $status,
                ]);
            }

            DB::commit();

            $payment->load(['customer', 'bill']);
            return response()->json($payment, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function show(Payment $payment): JsonResponse
    {
        $payment->load(['customer', 'bill']);
        return response()->json($payment);
    }

    public function update(Request $request, Payment $payment): JsonResponse
    {
        $validated = $request->validate([
            'payment_date' => 'sometimes|date',
            'amount' => 'sometimes|numeric|min:0.01',
            'payment_method' => 'sometimes|in:cash,bank_transfer,cheque,online',
            'notes' => 'nullable|string',
        ]);

        $payment->update($validated);
        $payment->load(['customer', 'bill']);
        return response()->json($payment);
    }

    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();
        return response()->json(['message' => 'Payment deleted successfully']);
    }
}

