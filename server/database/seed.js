import dbModule from './db.js';

async function seed() {
    console.log('Seeding database...');
    
    const db = await dbModule.initDatabase();
    
    try {
        // Clear existing data
        db.run('DELETE FROM area_delivery_boy');
        db.run('DELETE FROM subscriptions');
        db.run('DELETE FROM payments');
        db.run('DELETE FROM bill_items');
        db.run('DELETE FROM bills');
        db.run('DELETE FROM customers');
        db.run('DELETE FROM delivery_boys');
        db.run('DELETE FROM areas');
        db.run('DELETE FROM papers');

        // Insert Papers
        const papers = [
            ['The Times', 5.00, 'daily'],
            ['Daily News', 4.50, 'daily'],
            ['Morning Herald', 6.00, 'daily'],
            ['Weekly Magazine', 25.00, 'weekly'],
        ];
        
        const paperIds = [];
        papers.forEach(paper => {
            db.run(`INSERT INTO papers (name, price, type) VALUES ('${paper[0]}', ${paper[1]}, '${paper[2]}')`);
            const result = db.exec('SELECT last_insert_rowid() as id');
            paperIds.push(result[0].values[0][0]);
        });

        // Insert Areas
        const areas = [
            ['Downtown', 'DT001', 'Downtown area'],
            ['Uptown', 'UT001', 'Uptown area'],
            ['Suburbs', 'SB001', 'Suburban area'],
        ];
        
        const areaIds = [];
        areas.forEach(area => {
            db.run(`INSERT INTO areas (name, code, description) VALUES ('${area[0]}', '${area[1]}', '${area[2]}')`);
            const result = db.exec('SELECT last_insert_rowid() as id');
            areaIds.push(result[0].values[0][0]);
        });

        // Insert Delivery Boys
        const deliveryBoys = [
            ['John Doe', '1234567890', 'john@example.com', '123 Main St'],
            ['Jane Smith', '0987654321', 'jane@example.com', '456 Oak Ave'],
        ];
        
        const dbIds = [];
        deliveryBoys.forEach(deliveryBoy => {
            db.run(`INSERT INTO delivery_boys (name, phone, email, address) VALUES ('${deliveryBoy[0]}', '${deliveryBoy[1]}', '${deliveryBoy[2]}', '${deliveryBoy[3]}')`);
            const result = db.exec('SELECT last_insert_rowid() as id');
            dbIds.push(result[0].values[0][0]);
        });

        // Assign delivery boys to areas
        db.run(`INSERT INTO area_delivery_boy (area_id, delivery_boy_id) VALUES (${areaIds[0]}, ${dbIds[0]})`);
        db.run(`INSERT INTO area_delivery_boy (area_id, delivery_boy_id) VALUES (${areaIds[1]}, ${dbIds[1]})`);

        // Insert Customers
        const customers = [
            ['Alice Johnson', '1111111111', 'alice@example.com', '789 Pine St', areaIds[0], dbIds[0]],
            ['Bob Williams', '2222222222', 'bob@example.com', '321 Elm St', areaIds[1], dbIds[1]],
        ];
        
        const customerIds = [];
        customers.forEach(customer => {
            db.run(`INSERT INTO customers (name, phone, email, address, area_id, delivery_boy_id) VALUES ('${customer[0]}', '${customer[1]}', '${customer[2]}', '${customer[3]}', ${customer[4]}, ${customer[5]})`);
            const result = db.exec('SELECT last_insert_rowid() as id');
            customerIds.push(result[0].values[0][0]);
        });

        // Insert Subscriptions
        db.run(`INSERT INTO subscriptions (customer_id, paper_id, start_date) VALUES (${customerIds[0]}, ${paperIds[0]}, date('now', '-30 days'))`);
        db.run(`INSERT INTO subscriptions (customer_id, paper_id, start_date) VALUES (${customerIds[0]}, ${paperIds[1]}, date('now', '-30 days'))`);
        db.run(`INSERT INTO subscriptions (customer_id, paper_id, start_date) VALUES (${customerIds[1]}, ${paperIds[0]}, date('now', '-30 days'))`);
        db.run(`INSERT INTO subscriptions (customer_id, paper_id, start_date) VALUES (${customerIds[1]}, ${paperIds[1]}, date('now', '-30 days'))`);

        dbModule.saveDatabase();
        console.log('✓ Database seeded successfully!');
    } catch (error) {
        console.error('✗ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
