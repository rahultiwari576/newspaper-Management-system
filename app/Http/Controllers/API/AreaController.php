<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AreaController extends Controller
{
    public function index(): JsonResponse
    {
        $areas = Area::with('deliveryBoys')->orderBy('name')->get();
        return response()->json($areas);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:areas,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $area = Area::create($validated);
        return response()->json($area, 201);
    }

    public function show(Area $area): JsonResponse
    {
        $area->load('deliveryBoys', 'customers');
        return response()->json($area);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:areas,code,' . $area->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $area->update($validated);
        return response()->json($area);
    }

    public function destroy(Area $area): JsonResponse
    {
        $area->delete();
        return response()->json(['message' => 'Area deleted successfully']);
    }

    public function assignDeliveryBoy(Request $request, Area $area): JsonResponse
    {
        $validated = $request->validate([
            'delivery_boy_id' => 'required|exists:delivery_boys,id',
        ]);

        $area->deliveryBoys()->syncWithoutDetaching([$validated['delivery_boy_id']]);
        return response()->json(['message' => 'Delivery boy assigned successfully']);
    }
}

