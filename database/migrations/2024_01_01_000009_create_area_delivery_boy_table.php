<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area_delivery_boy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_id')->constrained('areas')->onDelete('cascade');
            $table->foreignId('delivery_boy_id')->constrained('delivery_boys')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['area_id', 'delivery_boy_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_delivery_boy');
    }
};

