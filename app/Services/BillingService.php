<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Customer;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Support\Str;

class BillingService
{
    /**
     * Generate bill for a customer for a specific period
     * 
     * Formula: For each active subscription:
     * - Calculate days in period (considering subscription start/end dates)
     * - Amount = Days × Paper Price
     * - Total = Sum of all subscription amounts
     */
    public function generateBill(int $customerId, string $periodStart, string $periodEnd, ?string $notes = null): Bill
    {
        $customer = Customer::findOrFail($customerId);
        
        $startDate = Carbon::parse($periodStart);
        $endDate = Carbon::parse($periodEnd);
        
        // Get active subscriptions for the customer
        $subscriptions = Subscription::where('customer_id', $customerId)
            ->where('is_active', true)
            ->with('paper')
            ->get();

        if ($subscriptions->isEmpty()) {
            throw new \Exception('No active subscriptions found for this customer');
        }

        // Generate bill number
        $billNumber = 'BILL-' . strtoupper(Str::random(8));

        // Create bill
        $bill = Bill::create([
            'customer_id' => $customerId,
            'bill_number' => $billNumber,
            'bill_date' => now(),
            'period_start' => $startDate,
            'period_end' => $endDate,
            'total_days' => $startDate->diffInDays($endDate) + 1,
            'notes' => $notes,
        ]);

        $subtotal = 0;

        // Create bill items for each subscription
        foreach ($subscriptions as $subscription) {
            $paper = $subscription->paper;
            
            // Calculate effective days for this subscription
            $subscriptionStart = Carbon::parse($subscription->start_date);
            $subscriptionEnd = $subscription->end_date 
                ? Carbon::parse($subscription->end_date) 
                : $endDate;

            // Calculate overlapping days
            $effectiveStart = $subscriptionStart->greaterThan($startDate) ? $subscriptionStart : $startDate;
            $effectiveEnd = $subscriptionEnd->lessThan($endDate) ? $subscriptionEnd : $endDate;

            if ($effectiveStart->greaterThan($effectiveEnd)) {
                continue; // Skip if no overlap
            }

            $days = $effectiveStart->diffInDays($effectiveEnd) + 1;
            
            // Calculate amount based on paper type
            if ($paper->type === 'weekly') {
                // For weekly papers, count number of weeks
                $weeks = ceil($days / 7);
                $amount = $weeks * $paper->price;
            } else {
                // For daily papers, multiply days by price
                $amount = $days * $paper->price;
            }

            BillItem::create([
                'bill_id' => $bill->id,
                'paper_id' => $paper->id,
                'days' => $days,
                'rate' => $paper->price,
                'amount' => $amount,
            ]);

            $subtotal += $amount;
        }

        // Update bill totals
        $bill->update([
            'subtotal' => $subtotal,
            'total_amount' => $subtotal,
            'due_amount' => $subtotal,
            'status' => 'pending',
        ]);

        return $bill->fresh(['items.paper']);
    }

    /**
     * Calculate due amount for a customer
     */
    public function calculateDueAmount(int $customerId): float
    {
        return Bill::where('customer_id', $customerId)
            ->sum('due_amount');
    }
}

