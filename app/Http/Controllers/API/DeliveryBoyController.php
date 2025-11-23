<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\DeliveryBoy;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DeliveryBoyController extends Controller
{
    public function index(): JsonResponse
    {
        $deliveryBoys = DeliveryBoy::with('areas')->orderBy('name')->get();
        return response()->json($deliveryBoys);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:delivery_boys,phone',
            'email' => 'nullable|email|unique:delivery_boys,email',
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $deliveryBoy = DeliveryBoy::create($validated);
        return response()->json($deliveryBoy, 201);
    }

    public function show(DeliveryBoy $deliveryBoy): JsonResponse
    {
        $deliveryBoy->load('areas', 'customers');
        return response()->json($deliveryBoy);
    }

    public function update(Request $request, DeliveryBoy $deliveryBoy): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20|unique:delivery_boys,phone,' . $deliveryBoy->id,
            'email' => 'nullable|email|unique:delivery_boys,email,' . $deliveryBoy->id,
            'address' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $deliveryBoy->update($validated);
        return response()->json($deliveryBoy);
    }

    public function destroy(DeliveryBoy $deliveryBoy): JsonResponse
    {
        $deliveryBoy->delete();
        return response()->json(['message' => 'Delivery boy deleted successfully']);
    }
}

