<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        $subscriptions = Subscription::with(['customer', 'paper'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($subscriptions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'paper_id' => 'required|exists:papers,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        $subscription = Subscription::create($validated);
        $subscription->load(['customer', 'paper']);
        return response()->json($subscription, 201);
    }

    public function show(Subscription $subscription): JsonResponse
    {
        $subscription->load(['customer', 'paper']);
        return response()->json($subscription);
    }

    public function update(Request $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'sometimes|exists:customers,id',
            'paper_id' => 'sometimes|exists:papers,id',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_active' => 'boolean',
        ]);

        $subscription->update($validated);
        $subscription->load(['customer', 'paper']);
        return response()->json($subscription);
    }

    public function destroy(Subscription $subscription): JsonResponse
    {
        $subscription->delete();
        return response()->json(['message' => 'Subscription deleted successfully']);
    }
}

