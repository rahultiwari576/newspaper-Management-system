import express from 'express';

export default function subscriptionsRouter(db) {
const router = express.Router();

    // Get all subscriptions
router.get('/', (req, res) => {
    try {
        const subscriptions = db.prepare(`
                SELECT s.*, c.name as customer_name, p.name as paper_name, p.price, p.type
            FROM subscriptions s
                INNER JOIN customers c ON s.customer_id = c.id
                INNER JOIN papers p ON s.paper_id = p.id
            ORDER BY s.created_at DESC
        `).all();
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single subscription
    router.get('/:id', (req, res) => {
        try {
            const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
            if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
            
            subscription.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(subscription.customer_id);
            subscription.paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(subscription.paper_id);
            
            res.json(subscription);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    // Create subscription
router.post('/', (req, res) => {
    try {
        const { customer_id, paper_id, start_date, end_date, is_active } = req.body;
            const result = db.prepare('INSERT INTO subscriptions (customer_id, paper_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?)')
                .run(customer_id, paper_id, start_date, end_date, is_active ?? 1);
        const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(result.lastInsertRowid);
            subscription.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(subscription.customer_id);
            subscription.paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(subscription.paper_id);
        res.status(201).json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update subscription
router.put('/:id', (req, res) => {
    try {
        const { customer_id, paper_id, start_date, end_date, is_active } = req.body;
            db.prepare('UPDATE subscriptions SET customer_id = ?, paper_id = ?, start_date = ?, end_date = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(customer_id, paper_id, start_date, end_date, is_active, req.params.id);
        const subscription = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
            if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
            subscription.customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(subscription.customer_id);
            subscription.paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(subscription.paper_id);
        res.json(subscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delete subscription
router.delete('/:id', (req, res) => {
    try {
            const result = db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Subscription not found' });
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
