<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Paper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class PaperController extends Controller
{
    public function index(): JsonResponse
    {
        $papers = Paper::orderBy('name')->get();
        return response()->json($papers);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'type' => ['required', Rule::in(['daily', 'weekly'])],
            'is_active' => 'boolean',
        ]);

        $paper = Paper::create($validated);
        return response()->json($paper, 201);
    }

    public function show(Paper $paper): JsonResponse
    {
        return response()->json($paper);
    }

    public function update(Request $request, Paper $paper): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'type' => ['sometimes', Rule::in(['daily', 'weekly'])],
            'is_active' => 'boolean',
        ]);

        $paper->update($validated);
        return response()->json($paper);
    }

    public function destroy(Paper $paper): JsonResponse
    {
        $paper->delete();
        return response()->json(['message' => 'Paper deleted successfully']);
    }
}

