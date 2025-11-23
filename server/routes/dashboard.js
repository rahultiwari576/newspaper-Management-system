import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        
        const stats = {
            total_customers: 0,
            total_areas: 0,
            total_delivery_boys: 0,
            total_papers: 0,
            unpaid_bills: 0,
            total_due_amount: 0,
            total_paid_amount: 0,
            pending_bills: 0,
            partial_bills: 0,
            paid_bills: 0,
        };
        
        // Get counts
        const customers = db.exec('SELECT COUNT(*) as count FROM customers WHERE is_active = 1');
        if (customers[0]?.values) stats.total_customers = customers[0].values[0][0];
        
        const areas = db.exec('SELECT COUNT(*) as count FROM areas WHERE is_active = 1');
        if (areas[0]?.values) stats.total_areas = areas[0].values[0][0];
        
        const deliveryBoys = db.exec('SELECT COUNT(*) as count FROM delivery_boys WHERE is_active = 1');
        if (deliveryBoys[0]?.values) stats.total_delivery_boys = deliveryBoys[0].values[0][0];
        
        const papers = db.exec('SELECT COUNT(*) as count FROM papers WHERE is_active = 1');
        if (papers[0]?.values) stats.total_papers = papers[0].values[0][0];
        
        const unpaid = db.exec("SELECT COUNT(*) as count FROM bills WHERE status != 'paid'");
        if (unpaid[0]?.values) stats.unpaid_bills = unpaid[0].values[0][0];
        
        const due = db.exec('SELECT SUM(due_amount) as total FROM bills');
        if (due[0]?.values && due[0].values[0][0]) stats.total_due_amount = due[0].values[0][0];
        
        const paid = db.exec('SELECT SUM(amount) as total FROM payments');
        if (paid[0]?.values && paid[0].values[0][0]) stats.total_paid_amount = paid[0].values[0][0];
        
        const pending = db.exec("SELECT COUNT(*) as count FROM bills WHERE status = 'pending'");
        if (pending[0]?.values) stats.pending_bills = pending[0].values[0][0];
        
        const partial = db.exec("SELECT COUNT(*) as count FROM bills WHERE status = 'partial'");
        if (partial[0]?.values) stats.partial_bills = partial[0].values[0][0];
        
        const paidBills = db.exec("SELECT COUNT(*) as count FROM bills WHERE status = 'paid'");
        if (paidBills[0]?.values) stats.paid_bills = paidBills[0].values[0][0];
        
        // Recent bills
        const recentBills = db.exec('SELECT b.*, c.name as customer_name FROM bills b LEFT JOIN customers c ON b.customer_id = c.id ORDER BY b.created_at DESC LIMIT 10');
        const bills = recentBills[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_number: row[2],
            bill_date: row[3],
            period_start: row[4],
            period_end: row[5],
            total_days: row[6],
            subtotal: row[7],
            total_amount: row[8],
            paid_amount: row[9],
            due_amount: row[10],
            status: row[11],
            customer: row[13] ? { name: row[13] } : null,
        })) || [];
        
        // Recent payments
        const recentPayments = db.exec('SELECT p.*, c.name as customer_name FROM payments p LEFT JOIN customers c ON p.customer_id = c.id ORDER BY p.created_at DESC LIMIT 10');
        const payments = recentPayments[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
            customer: row[8] ? { name: row[8] } : null,
        })) || [];
        
        res.json({
            stats,
            recent_bills: bills,
            recent_payments: payments,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
