import express from 'express';

export default function customersRouter(db) {
const router = express.Router();

    // Get all customers
router.get('/', (req, res) => {
    try {
            const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
            customers.forEach(customer => {
                customer.area = db.prepare('SELECT * FROM areas WHERE id = ?').get(customer.area_id);
                if (customer.delivery_boy_id) {
                    customer.delivery_boy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(customer.delivery_boy_id);
                }
                const subscriptions = db.prepare(`
                    SELECT s.*, p.name as paper_name, p.price, p.type 
                    FROM subscriptions s
                    INNER JOIN papers p ON s.paper_id = p.id
                    WHERE s.customer_id = ?
                `).all(customer.id);
                customer.subscriptions = subscriptions;
            });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single customer
router.get('/:id', (req, res) => {
    try {
            const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
            
            customer.area = db.prepare('SELECT * FROM areas WHERE id = ?').get(customer.area_id);
            if (customer.delivery_boy_id) {
                customer.delivery_boy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(customer.delivery_boy_id);
            }
            
            const subscriptions = db.prepare(`
                SELECT s.*, p.name as paper_name, p.price, p.type 
                FROM subscriptions s
                INNER JOIN papers p ON s.paper_id = p.id
                WHERE s.customer_id = ?
            `).all(customer.id);
            customer.subscriptions = subscriptions;
            
            const bills = db.prepare('SELECT * FROM bills WHERE customer_id = ?').all(customer.id);
            customer.bills = bills;
            
            const payments = db.prepare('SELECT * FROM payments WHERE customer_id = ?').all(customer.id);
            customer.payments = payments;
            
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Create customer
router.post('/', (req, res) => {
    try {
        const { name, phone, email, address, area_id, delivery_boy_id, is_active } = req.body;
            const result = db.prepare('INSERT INTO customers (name, phone, email, address, area_id, delivery_boy_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .run(name, phone, email, address, area_id, delivery_boy_id, is_active ?? 1);
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);
            customer.area = db.prepare('SELECT * FROM areas WHERE id = ?').get(customer.area_id);
            if (customer.delivery_boy_id) {
                customer.delivery_boy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(customer.delivery_boy_id);
            }
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update customer
router.put('/:id', (req, res) => {
    try {
        const { name, phone, email, address, area_id, delivery_boy_id, is_active } = req.body;
            db.prepare('UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, area_id = ?, delivery_boy_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(name, phone, email, address, area_id, delivery_boy_id, is_active, req.params.id);
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });
            customer.area = db.prepare('SELECT * FROM areas WHERE id = ?').get(customer.area_id);
            if (customer.delivery_boy_id) {
                customer.delivery_boy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(customer.delivery_boy_id);
            }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delete customer
router.delete('/:id', (req, res) => {
    try {
            const result = db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
