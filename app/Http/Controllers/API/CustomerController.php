<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::with(['area', 'deliveryBoy', 'subscriptions.paper'])
            ->orderBy('name')
            ->get();
        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'email' => 'nullable|email|unique:customers,email',
            'address' => 'required|string',
            'area_id' => 'required|exists:areas,id',
            'delivery_boy_id' => 'nullable|exists:delivery_boys,id',
            'is_active' => 'boolean',
        ]);

        $customer = Customer::create($validated);
        $customer->load(['area', 'deliveryBoy']);
        return response()->json($customer, 201);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->load(['area', 'deliveryBoy', 'subscriptions.paper', 'bills', 'payments']);
        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:customers,phone,' . $customer->id,
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'address' => 'sometimes|string',
            'area_id' => 'sometimes|exists:areas,id',
            'delivery_boy_id' => 'nullable|exists:delivery_boys,id',
            'is_active' => 'boolean',
        ]);

        $customer->update($validated);
        $customer->load(['area', 'deliveryBoy']);
        return response()->json($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(['message' => 'Customer deleted successfully']);
    }
}

