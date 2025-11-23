import express from 'express';

export default function paymentsRouter(db) {
const router = express.Router();

    // Get all payments
router.get('/', (req, res) => {
    try {
            let query = 'SELECT * FROM payments WHERE 1=1';
        const params = [];

            if (req.query.customer_id) {
                query += ' AND customer_id = ?';
                params.push(req.query.customer_id);
        }
            if (req.query.bill_id) {
                query += ' AND bill_id = ?';
                params.push(req.query.bill_id);
        }

            query += ' ORDER BY payment_date DESC';
            
        const payments = db.prepare(query).all(...params);
            payments.forEach(payment => {
                payment.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(payment.customer_id);
                if (payment.bill_id) {
                    payment.bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(payment.bill_id);
                }
            });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single payment
    router.get('/:id', (req, res) => {
        try {
            const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });
            
            payment.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(payment.customer_id);
            if (payment.bill_id) {
                payment.bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(payment.bill_id);
            }
            
            res.json(payment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Create payment
router.post('/', (req, res) => {
    try {
        const { customer_id, bill_id, payment_date, amount, payment_method, notes } = req.body;
            
            // Generate payment number
            const paymentNumber = `PAY-${Date.now().toString(36).toUpperCase()}`;

        const result = db.prepare(`
            INSERT INTO payments (customer_id, bill_id, payment_number, payment_date, amount, payment_method, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(customer_id, bill_id || null, paymentNumber, payment_date, amount, payment_method || 'cash', notes || null);

        // Update bill if linked
        if (bill_id) {
            const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(bill_id);
                if (bill) {
                    const newPaidAmount = bill.paid_amount + amount;
            const newDueAmount = Math.max(0, bill.total_amount - newPaidAmount);
                    const status = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

                    db.prepare('UPDATE bills SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?')
                        .run(newPaidAmount, newDueAmount, status, bill_id);
                }
        }

        const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
            payment.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(payment.customer_id);
            if (payment.bill_id) {
                payment.bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(payment.bill_id);
            }
            
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update payment
    router.put('/:id', (req, res) => {
        try {
            const { payment_date, amount, payment_method, notes } = req.body;
            db.prepare('UPDATE payments SET payment_date = ?, amount = ?, payment_method = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(payment_date, amount, payment_method, notes, req.params.id);
            const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
            if (!payment) return res.status(404).json({ error: 'Payment not found' });
            payment.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(payment.customer_id);
            if (payment.bill_id) {
                payment.bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(payment.bill_id);
            }
            res.json(payment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Delete payment
    router.delete('/:id', (req, res) => {
        try {
            const result = db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Payment not found' });
            res.json({ message: 'Payment deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    return router;
}
