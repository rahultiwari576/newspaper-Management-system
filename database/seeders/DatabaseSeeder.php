<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Paper;
use App\Models\Area;
use App\Models\DeliveryBoy;
use App\Models\Customer;
use App\Models\Subscription;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Papers
        $papers = [
            ['name' => 'The Times', 'price' => 5.00, 'type' => 'daily'],
            ['name' => 'Daily News', 'price' => 4.50, 'type' => 'daily'],
            ['name' => 'Morning Herald', 'price' => 6.00, 'type' => 'daily'],
            ['name' => 'Weekly Magazine', 'price' => 25.00, 'type' => 'weekly'],
        ];

        foreach ($papers as $paper) {
            Paper::create($paper);
        }

        // Create Areas
        $areas = [
            ['name' => 'Downtown', 'code' => 'DT001', 'description' => 'Downtown area'],
            ['name' => 'Uptown', 'code' => 'UT001', 'description' => 'Uptown area'],
            ['name' => 'Suburbs', 'code' => 'SB001', 'description' => 'Suburban area'],
        ];

        foreach ($areas as $area) {
            Area::create($area);
        }

        // Create Delivery Boys
        $deliveryBoys = [
            ['name' => 'John Doe', 'phone' => '1234567890', 'email' => 'john@example.com', 'address' => '123 Main St'],
            ['name' => 'Jane Smith', 'phone' => '0987654321', 'email' => 'jane@example.com', 'address' => '456 Oak Ave'],
        ];

        foreach ($deliveryBoys as $db) {
            DeliveryBoy::create($db);
        }

        // Assign delivery boys to areas
        $area1 = Area::where('code', 'DT001')->first();
        $area2 = Area::where('code', 'UT001')->first();
        $db1 = DeliveryBoy::where('phone', '1234567890')->first();
        $db2 = DeliveryBoy::where('phone', '0987654321')->first();

        if ($area1 && $db1) {
            $area1->deliveryBoys()->attach($db1->id);
        }
        if ($area2 && $db2) {
            $area2->deliveryBoys()->attach($db2->id);
        }

        // Create Customers
        $customers = [
            [
                'name' => 'Alice Johnson',
                'phone' => '1111111111',
                'email' => 'alice@example.com',
                'address' => '789 Pine St',
                'area_id' => Area::where('code', 'DT001')->first()->id,
                'delivery_boy_id' => $db1->id,
            ],
            [
                'name' => 'Bob Williams',
                'phone' => '2222222222',
                'email' => 'bob@example.com',
                'address' => '321 Elm St',
                'area_id' => Area::where('code', 'UT001')->first()->id,
                'delivery_boy_id' => $db2->id,
            ],
        ];

        foreach ($customers as $customer) {
            $customerModel = Customer::create($customer);

            // Create subscriptions
            $timesPaper = Paper::where('name', 'The Times')->first();
            $dailyNewsPaper = Paper::where('name', 'Daily News')->first();

            if ($timesPaper) {
                Subscription::create([
                    'customer_id' => $customerModel->id,
                    'paper_id' => $timesPaper->id,
                    'start_date' => now()->subDays(30),
                    'is_active' => true,
                ]);
            }

            if ($dailyNewsPaper) {
                Subscription::create([
                    'customer_id' => $customerModel->id,
                    'paper_id' => $dailyNewsPaper->id,
                    'start_date' => now()->subDays(15),
                    'is_active' => true,
                ]);
            }
        }
    }
}

