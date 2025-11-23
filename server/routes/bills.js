import express from 'express';
import dbModule from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        let query = 'SELECT b.*, c.name as customer_name FROM bills b LEFT JOIN customers c ON b.customer_id = c.id';
        if (req.query.customer_id) {
            query += ` WHERE b.customer_id = ${parseInt(req.query.customer_id)}`;
        }
        if (req.query.status) {
            query += req.query.customer_id ? ' AND' : ' WHERE';
            query += ` b.status = '${req.query.status}'`;
        }
        query += ' ORDER BY b.bill_date DESC';
        
        const result = db.exec(query);
        const bills = result[0]?.values.map(row => ({
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
            notes: row[12],
            customer: row[13] ? { name: row[13] } : null,
        })) || [];
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { customer_id, period_start, period_end, notes } = req.body;
        const db = await dbModule.getDb();
        
        // Generate bill using billing service logic
        const billNumber = 'BILL-' + uuidv4().substring(0, 8).toUpperCase();
        const billDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(period_start);
        const endDate = new Date(period_end);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        // Get active subscriptions
        const subscriptions = db.exec(`
            SELECT s.*, p.price, p.type 
            FROM subscriptions s 
            JOIN papers p ON s.paper_id = p.id 
            WHERE s.customer_id = ${customer_id} AND s.is_active = 1
        `);
        
        let subtotal = 0;
        const billItems = [];
        
        if (subscriptions[0]?.values) {
            for (const sub of subscriptions[0].values) {
                const paperId = sub[2];
                const price = sub[6];
                const type = sub[7];
                
                // Calculate days (simplified - would need proper date overlap logic)
                let days = totalDays;
                let amount = 0;
                
                if (type === 'weekly') {
                    const weeks = Math.ceil(days / 7);
                    amount = weeks * price;
                } else {
                    amount = days * price;
                }
                
                billItems.push({ paper_id: paperId, days, rate: price, amount });
                subtotal += amount;
            }
        }
        
        // Create bill
        db.run(`INSERT INTO bills (customer_id, bill_number, bill_date, period_start, period_end, total_days, subtotal, total_amount, paid_amount, due_amount, status, notes) VALUES (${customer_id}, '${billNumber}', '${billDate}', '${period_start}', '${period_end}', ${totalDays}, ${subtotal}, ${subtotal}, 0, ${subtotal}, 'pending', ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'})`);
        const billResult = db.exec('SELECT last_insert_rowid() as id');
        const billId = billResult[0].values[0][0];
        
        // Create bill items
        for (const item of billItems) {
            db.run(`INSERT INTO bill_items (bill_id, paper_id, days, rate, amount) VALUES (${billId}, ${item.paper_id}, ${item.days}, ${item.rate}, ${item.amount})`);
        }
        
        dbModule.saveDatabase();
        res.status(201).json({ id: billId, bill_number: billNumber, total_amount: subtotal });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM bills WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Bill not found' });
        }
        const row = result[0].values[0];
        res.json({
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
            notes: row[12],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { notes } = req.body;
        const db = await dbModule.getDb();
        if (notes !== undefined) {
            db.run(`UPDATE bills SET notes = '${notes.replace(/'/g, "''")}', updated_at = CURRENT_TIMESTAMP WHERE id = ${parseInt(req.params.id)}`);
            dbModule.saveDatabase();
        }
        res.json({ message: 'Bill updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM bills WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
