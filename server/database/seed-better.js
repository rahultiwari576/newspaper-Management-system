import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
    console.log('Seeding database...');
    
    const dbPath = join(__dirname, '../../database/newspaper.db');
    const db = new Database(dbPath);
    
    try {
        // Clear existing data (in correct order due to foreign keys)
        db.exec('DELETE FROM area_delivery_boy');
        db.exec('DELETE FROM subscriptions');
        db.exec('DELETE FROM payments');
        db.exec('DELETE FROM bill_items');
        db.exec('DELETE FROM bills');
        db.exec('DELETE FROM customers');
        db.exec('DELETE FROM delivery_boys');
        db.exec('DELETE FROM areas');
        db.exec('DELETE FROM papers');
        db.exec('DELETE FROM users');

        // Insert Users
        const defaultPassword = await bcrypt.hash('password123', 10);
        const users = [
            ['Admin User', 'admin@newspaper.com', defaultPassword, 'admin'],
            ['Manager User', 'manager@newspaper.com', defaultPassword, 'manager'],
            ['Staff User', 'staff@newspaper.com', defaultPassword, 'staff'],
        ];
        
        users.forEach(user => {
            db.prepare(`
                INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)
            `).run(user[0], user[1], user[2], user[3]);
        });
        console.log('✓ Users seeded');

        // Insert Papers
        const papers = [
            ['The Times', 5.00, 'daily'],
            ['Daily News', 4.50, 'daily'],
            ['Morning Herald', 6.00, 'daily'],
            ['Evening Post', 5.50, 'daily'],
            ['Weekly Magazine', 25.00, 'weekly'],
            ['Sunday Special', 30.00, 'weekly'],
        ];
        
        const paperIds = [];
        const insertPaper = db.prepare('INSERT INTO papers (name, price, type) VALUES (?, ?, ?)');
        papers.forEach(paper => {
            const result = insertPaper.run(paper[0], paper[1], paper[2]);
            paperIds.push(Number(result.lastInsertRowid));
        });
        console.log('✓ Papers seeded');

        // Insert Areas
        const areas = [
            ['Downtown', 'DT001', 'Downtown commercial area'],
            ['Uptown', 'UT001', 'Uptown residential area'],
            ['Suburbs', 'SB001', 'Suburban residential area'],
            ['East Side', 'ES001', 'East side neighborhood'],
            ['West Side', 'WS001', 'West side neighborhood'],
        ];
        
        const areaIds = [];
        const insertArea = db.prepare('INSERT INTO areas (name, code, description) VALUES (?, ?, ?)');
        areas.forEach(area => {
            const result = insertArea.run(area[0], area[1], area[2]);
            areaIds.push(Number(result.lastInsertRowid));
        });
        console.log('✓ Areas seeded');

        // Insert Delivery Boys
        const deliveryBoys = [
            ['John Doe', '1234567890', 'john@example.com', '123 Main St'],
            ['Jane Smith', '0987654321', 'jane@example.com', '456 Oak Ave'],
            ['Mike Johnson', '1122334455', 'mike@example.com', '789 Pine St'],
            ['Sarah Williams', '2233445566', 'sarah@example.com', '321 Elm St'],
            ['Tom Brown', '3344556677', 'tom@example.com', '654 Maple Ave'],
        ];
        
        const dbIds = [];
        const insertDeliveryBoy = db.prepare(`
            INSERT INTO delivery_boys (name, phone, email, address)
            VALUES (?, ?, ?, ?)
        `);
        deliveryBoys.forEach(deliveryBoy => {
            const result = insertDeliveryBoy.run(
                deliveryBoy[0], deliveryBoy[1], deliveryBoy[2], deliveryBoy[3]
            );
            dbIds.push(Number(result.lastInsertRowid));
        });
        console.log('✓ Delivery boys seeded');

        // Assign delivery boys to areas
        const insertAreaDeliveryBoy = db.prepare(`
            INSERT INTO area_delivery_boy (area_id, delivery_boy_id)
            VALUES (?, ?)
        `);
        insertAreaDeliveryBoy.run(areaIds[0], dbIds[0]);
        insertAreaDeliveryBoy.run(areaIds[1], dbIds[1]);
        insertAreaDeliveryBoy.run(areaIds[2], dbIds[2]);
        insertAreaDeliveryBoy.run(areaIds[3], dbIds[3]);
        insertAreaDeliveryBoy.run(areaIds[4], dbIds[4]);
        insertAreaDeliveryBoy.run(areaIds[0], dbIds[1]); // Multiple delivery boys for downtown
        console.log('✓ Area-delivery boy assignments seeded');

        // Insert Customers
        const customers = [
            ['Alice Johnson', '1111111111', 'alice@example.com', '789 Pine St', areaIds[0], dbIds[0]],
            ['Bob Williams', '2222222222', 'bob@example.com', '321 Elm St', areaIds[1], dbIds[1]],
            ['Charlie Brown', '3333333333', 'charlie@example.com', '654 Maple Ave', areaIds[2], dbIds[2]],
            ['Diana Prince', '4444444444', 'diana@example.com', '987 Oak St', areaIds[3], dbIds[3]],
            ['Edward Lee', '5555555555', 'edward@example.com', '147 Cedar Ln', areaIds[4], dbIds[4]],
            ['Fiona Green', '6666666666', 'fiona@example.com', '258 Birch Dr', areaIds[0], dbIds[0]],
            ['George White', '7777777777', 'george@example.com', '369 Spruce Way', areaIds[1], dbIds[1]],
            ['Helen Black', '8888888888', 'helen@example.com', '470 Willow Rd', areaIds[2], dbIds[2]],
        ];
        
        const customerIds = [];
        const insertCustomer = db.prepare(`
            INSERT INTO customers (name, phone, email, address, area_id, delivery_boy_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        customers.forEach(customer => {
            const result = insertCustomer.run(
                customer[0], customer[1], customer[2], customer[3],
                customer[4], customer[5]
            );
            customerIds.push(Number(result.lastInsertRowid));
        });
        console.log('✓ Customers seeded');

        // Insert Subscriptions
        const insertSubscription = db.prepare(`
            INSERT INTO subscriptions (customer_id, paper_id, start_date)
            VALUES (?, ?, date('now', '-' || ? || ' days'))
        `);
        
        // Multiple subscriptions per customer
        insertSubscription.run(customerIds[0], paperIds[0], 30);
        insertSubscription.run(customerIds[0], paperIds[1], 30);
        insertSubscription.run(customerIds[1], paperIds[0], 60);
        insertSubscription.run(customerIds[1], paperIds[2], 60);
        insertSubscription.run(customerIds[2], paperIds[1], 45);
        insertSubscription.run(customerIds[2], paperIds[4], 45);
        insertSubscription.run(customerIds[3], paperIds[0], 90);
        insertSubscription.run(customerIds[3], paperIds[1], 90);
        insertSubscription.run(customerIds[3], paperIds[2], 90);
        insertSubscription.run(customerIds[4], paperIds[2], 20);
        insertSubscription.run(customerIds[5], paperIds[0], 15);
        insertSubscription.run(customerIds[5], paperIds[5], 15);
        insertSubscription.run(customerIds[6], paperIds[1], 75);
        insertSubscription.run(customerIds[7], paperIds[3], 10);
        console.log('✓ Subscriptions seeded');

        // Insert Bills
        const insertBill = db.prepare(`
            INSERT INTO bills (
                customer_id, bill_number, bill_date, period_start, period_end,
                total_days, subtotal, total_amount, paid_amount, due_amount, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const billIds = [];
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        // Bill 1 - Paid
        const bill1Id = insertBill.run(
            customerIds[0],
            'BILL-001',
            lastMonth.toISOString().split('T')[0],
            lastMonth.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            30,
            300.00,
            300.00,
            300.00,
            0.00,
            'paid'
        ).lastInsertRowid;
        billIds.push(Number(bill1Id));
        
        // Bill 2 - Partial
        const bill2Id = insertBill.run(
            customerIds[1],
            'BILL-002',
            lastMonth.toISOString().split('T')[0],
            lastMonth.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            30,
            450.00,
            450.00,
            200.00,
            250.00,
            'partial'
        ).lastInsertRowid;
        billIds.push(Number(bill2Id));
        
        // Bill 3 - Pending
        const bill3Id = insertBill.run(
            customerIds[2],
            'BILL-003',
            lastMonth.toISOString().split('T')[0],
            lastMonth.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            30,
            225.00,
            225.00,
            0.00,
            225.00,
            'pending'
        ).lastInsertRowid;
        billIds.push(Number(bill3Id));
        
        // Bill 4 - Paid
        const bill4Id = insertBill.run(
            customerIds[3],
            'BILL-004',
            lastMonth.toISOString().split('T')[0],
            lastMonth.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            30,
            600.00,
            600.00,
            600.00,
            0.00,
            'paid'
        ).lastInsertRowid;
        billIds.push(Number(bill4Id));
        
        // Bill 5 - Pending
        const bill5Id = insertBill.run(
            customerIds[4],
            'BILL-005',
            lastMonth.toISOString().split('T')[0],
            lastMonth.toISOString().split('T')[0],
            today.toISOString().split('T')[0],
            30,
            180.00,
            180.00,
            0.00,
            180.00,
            'pending'
        ).lastInsertRowid;
        billIds.push(Number(bill5Id));
        
        console.log('✓ Bills seeded');

        // Insert Bill Items
        const insertBillItem = db.prepare(`
            INSERT INTO bill_items (bill_id, paper_id, days, rate, amount)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        // Bill 1 items
        insertBillItem.run(billIds[0], paperIds[0], 30, 5.00, 150.00);
        insertBillItem.run(billIds[0], paperIds[1], 30, 4.50, 135.00);
        
        // Bill 2 items
        insertBillItem.run(billIds[1], paperIds[0], 30, 5.00, 150.00);
        insertBillItem.run(billIds[1], paperIds[2], 30, 6.00, 180.00);
        insertBillItem.run(billIds[1], paperIds[1], 30, 4.50, 135.00);
        
        // Bill 3 items
        insertBillItem.run(billIds[2], paperIds[1], 30, 4.50, 135.00);
        insertBillItem.run(billIds[2], paperIds[4], 4, 25.00, 100.00); // Weekly for 4 weeks
        
        // Bill 4 items
        insertBillItem.run(billIds[3], paperIds[0], 30, 5.00, 150.00);
        insertBillItem.run(billIds[3], paperIds[1], 30, 4.50, 135.00);
        insertBillItem.run(billIds[3], paperIds[2], 30, 6.00, 180.00);
        insertBillItem.run(billIds[3], paperIds[3], 30, 5.50, 165.00);
        
        // Bill 5 items
        insertBillItem.run(billIds[4], paperIds[2], 30, 6.00, 180.00);
        
        console.log('✓ Bill items seeded');

        // Insert Payments
        const insertPayment = db.prepare(`
            INSERT INTO payments (
                customer_id, bill_id, payment_number, payment_date,
                amount, payment_method, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        // Payment for Bill 1 (fully paid)
        insertPayment.run(
            customerIds[0],
            billIds[0],
            'PAY-001',
            lastMonth.toISOString().split('T')[0],
            300.00,
            'cash',
            'Full payment for Bill-001'
        );
        
        // Payment for Bill 2 (partial)
        insertPayment.run(
            customerIds[1],
            billIds[1],
            'PAY-002',
            lastMonth.toISOString().split('T')[0],
            200.00,
            'bank_transfer',
            'Partial payment for Bill-002'
        );
        
        // Payment for Bill 4 (fully paid)
        insertPayment.run(
            customerIds[3],
            billIds[3],
            'PAY-003',
            lastMonth.toISOString().split('T')[0],
            600.00,
            'online',
            'Full payment for Bill-004'
        );
        
        // Additional payment (advance payment)
        insertPayment.run(
            customerIds[5],
            null,
            'PAY-004',
            today.toISOString().split('T')[0],
            500.00,
            'cash',
            'Advance payment'
        );
        
        // Another payment
        insertPayment.run(
            customerIds[6],
            null,
            'PAY-005',
            today.toISOString().split('T')[0],
            250.00,
            'cheque',
            'Monthly payment'
        );
        
        console.log('✓ Payments seeded');

        db.close();
        console.log('✓ Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('   Email: admin@newspaper.com');
        console.log('   Password: password123');
        console.log('\n   Email: manager@newspaper.com');
        console.log('   Password: password123');
        console.log('\n   Email: staff@newspaper.com');
        console.log('   Password: password123');
    } catch (error) {
        console.error('✗ Seeding failed:', error);
        db.close();
        process.exit(1);
    }
}

seed();

