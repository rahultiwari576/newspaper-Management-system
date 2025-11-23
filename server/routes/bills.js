import express from 'express';

export default function billsRouter(db) {
const router = express.Router();
    
    // Get all bills
    router.get('/', (req, res) => {
        try {
            let query = 'SELECT * FROM bills WHERE 1=1';
            const params = [];
            
            if (req.query.customer_id) {
                query += ' AND customer_id = ?';
                params.push(req.query.customer_id);
            }
            if (req.query.status) {
                query += ' AND status = ?';
                params.push(req.query.status);
            }
            
            query += ' ORDER BY bill_date DESC';
            
            const bills = db.prepare(query).all(...params);
            bills.forEach(bill => {
                bill.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(bill.customer_id);
                const items = db.prepare(`
                    SELECT bi.*, p.name as paper_name, p.type
                    FROM bill_items bi
                    INNER JOIN papers p ON bi.paper_id = p.id
                    WHERE bi.bill_id = ?
                `).all(bill.id);
                bill.items = items;
            });
            res.json(bills);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Get single bill
    router.get('/:id', (req, res) => {
        try {
            const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id);
            if (!bill) return res.status(404).json({ error: 'Bill not found' });
            
            bill.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(bill.customer_id);
            const items = db.prepare(`
                SELECT bi.*, p.name as paper_name, p.type
                FROM bill_items bi
                INNER JOIN papers p ON bi.paper_id = p.id
                WHERE bi.bill_id = ?
            `).all(bill.id);
            bill.items = items;
            
            const payments = db.prepare('SELECT * FROM payments WHERE bill_id = ?').all(bill.id);
            bill.payments = payments;
            
            res.json(bill);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Generate bill
    router.post('/', (req, res) => {
        try {
            const { customer_id, period_start, period_end, notes } = req.body;
    
    // Get active subscriptions
    const subscriptions = db.prepare(`
        SELECT s.*, p.price, p.type, p.name as paper_name
        FROM subscriptions s
                INNER JOIN papers p ON s.paper_id = p.id
        WHERE s.customer_id = ? AND s.is_active = 1
            `).all(customer_id);

    if (subscriptions.length === 0) {
                return res.status(400).json({ error: 'No active subscriptions found for this customer' });
    }

            // Calculate dates
            const startDate = new Date(period_start);
            const endDate = new Date(period_end);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // Generate bill number
            const billNumber = `BILL-${Date.now().toString(36).toUpperCase()}`;

    // Create bill
    const billResult = db.prepare(`
                INSERT INTO bills (customer_id, bill_number, bill_date, period_start, period_end, total_days, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(customer_id, billNumber, new Date().toISOString().split('T')[0], period_start, period_end, totalDays, notes || null);

    const billId = billResult.lastInsertRowid;
    let subtotal = 0;

    // Create bill items
            subscriptions.forEach(sub => {
        const subStart = new Date(Math.max(new Date(sub.start_date), startDate));
                const subEnd = sub.end_date ? new Date(Math.min(new Date(sub.end_date), endDate)) : endDate;

                if (subStart > subEnd) return;

        const days = Math.ceil((subEnd - subStart) / (1000 * 60 * 60 * 24)) + 1;
                let amount = 0;

        if (sub.type === 'weekly') {
            const weeks = Math.ceil(days / 7);
            amount = weeks * sub.price;
        } else {
            amount = days * sub.price;
        }

                db.prepare('INSERT INTO bill_items (bill_id, paper_id, days, rate, amount) VALUES (?, ?, ?, ?, ?)')
                    .run(billId, sub.paper_id, days, sub.price, amount);

        subtotal += amount;
            });

    // Update bill totals
            db.prepare('UPDATE bills SET subtotal = ?, total_amount = ?, due_amount = ? WHERE id = ?')
                .run(subtotal, subtotal, subtotal, billId);

            const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
            bill.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(bill.customer_id);
            const items = db.prepare(`
                SELECT bi.*, p.name as paper_name, p.type
                FROM bill_items bi
                INNER JOIN papers p ON bi.paper_id = p.id
                WHERE bi.bill_id = ?
            `).all(billId);
            bill.items = items;
            
            res.status(201).json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Generate monthly bills
router.post('/generate-monthly', (req, res) => {
    try {
        const { year, month } = req.body;
        const periodStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const periodEnd = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

            const customers = db.prepare('SELECT * FROM customers WHERE is_active = 1').all();
        const generated = [];

            customers.forEach(customer => {
                const subscriptions = db.prepare(`
                    SELECT s.*, p.price, p.type
                    FROM subscriptions s
                    INNER JOIN papers p ON s.paper_id = p.id
                    WHERE s.customer_id = ? AND s.is_active = 1
                `).all(customer.id);
                
                if (subscriptions.length === 0) return;
                
                const billNumber = `BILL-${Date.now().toString(36).toUpperCase()}-${customer.id}`;
                const totalDays = lastDay;
                
                const billResult = db.prepare(`
                    INSERT INTO bills (customer_id, bill_number, bill_date, period_start, period_end, total_days)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(customer.id, billNumber, new Date().toISOString().split('T')[0], periodStart, periodEnd, totalDays);
                
                const billId = billResult.lastInsertRowid;
                let subtotal = 0;
                
                subscriptions.forEach(sub => {
                    let amount = 0;
                    if (sub.type === 'weekly') {
                        const weeks = Math.ceil(totalDays / 7);
                        amount = weeks * sub.price;
                    } else {
                        amount = totalDays * sub.price;
                    }
                    
                    db.prepare('INSERT INTO bill_items (bill_id, paper_id, days, rate, amount) VALUES (?, ?, ?, ?, ?)')
                        .run(billId, sub.paper_id, totalDays, sub.price, amount);
                    
                    subtotal += amount;
                });
                
                db.prepare('UPDATE bills SET subtotal = ?, total_amount = ?, due_amount = ? WHERE id = ?')
                    .run(subtotal, subtotal, subtotal, billId);
                
                generated.push(billId);
            });

        res.json({ message: 'Bills generated successfully', count: generated.length, bills: generated });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Update bill
    router.put('/:id', (req, res) => {
        try {
            const { notes } = req.body;
            db.prepare('UPDATE bills SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(notes, req.params.id);
            const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(req.params.id);
            if (!bill) return res.status(404).json({ error: 'Bill not found' });
            bill.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(bill.customer_id);
            const items = db.prepare(`
                SELECT bi.*, p.name as paper_name, p.type
                FROM bill_items bi
                INNER JOIN papers p ON bi.paper_id = p.id
                WHERE bi.bill_id = ?
            `).all(bill.id);
            bill.items = items;
            res.json(bill);
    } catch (error) {
            res.status(500).json({ error: error.message });
    }
});

    // Delete bill
    router.delete('/:id', (req, res) => {
        try {
            const result = db.prepare('DELETE FROM bills WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Bill not found' });
            res.json({ message: 'Bill deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    return router;
}
