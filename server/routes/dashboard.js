import express from 'express';

export default function dashboardRouter(db) {
const router = express.Router();

router.get('/', (req, res) => {
    try {
        const stats = {
            total_customers: db.prepare('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').get().count,
            total_areas: db.prepare('SELECT COUNT(*) as count FROM areas WHERE is_active = 1').get().count,
            total_delivery_boys: db.prepare('SELECT COUNT(*) as count FROM delivery_boys WHERE is_active = 1').get().count,
            total_papers: db.prepare('SELECT COUNT(*) as count FROM papers WHERE is_active = 1').get().count,
            unpaid_bills: db.prepare("SELECT COUNT(*) as count FROM bills WHERE status != 'paid'").get().count,
                total_due_amount: db.prepare('SELECT COALESCE(SUM(due_amount), 0) as total FROM bills').get().total || 0,
                total_paid_amount: db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments').get().total || 0,
            pending_bills: db.prepare("SELECT COUNT(*) as count FROM bills WHERE status = 'pending'").get().count,
            partial_bills: db.prepare("SELECT COUNT(*) as count FROM bills WHERE status = 'partial'").get().count,
            paid_bills: db.prepare("SELECT COUNT(*) as count FROM bills WHERE status = 'paid'").get().count,
        };

            // Recent bills
        const recentBills = db.prepare(`
            SELECT b.*, c.name as customer_name
            FROM bills b
                INNER JOIN customers c ON b.customer_id = c.id
            ORDER BY b.created_at DESC
            LIMIT 10
        `).all();

            recentBills.forEach(bill => {
                const items = db.prepare(`
                    SELECT bi.*, p.name as paper_name
                    FROM bill_items bi
                    INNER JOIN papers p ON bi.paper_id = p.id
                    WHERE bi.bill_id = ?
                `).all(bill.id);
                bill.items = items;
                bill.customer = { name: bill.customer_name };
            });
            
            // Recent payments
        const recentPayments = db.prepare(`
                SELECT p.*, c.name as customer_name
            FROM payments p
                INNER JOIN customers c ON p.customer_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 10
        `).all();

            recentPayments.forEach(payment => {
                payment.customer = { name: payment.customer_name };
                if (payment.bill_id) {
                    payment.bill = db.prepare('SELECT bill_number FROM bills WHERE id = ?').get(payment.bill_id);
                }
            });
            
            res.json({
                stats,
                recent_bills: recentBills,
                recent_payments: recentPayments,
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
