import express from 'express';
import dbModule from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        let query = 'SELECT p.*, c.name as customer_name, b.bill_number FROM payments p LEFT JOIN customers c ON p.customer_id = c.id LEFT JOIN bills b ON p.bill_id = b.id';
        if (req.query.customer_id) {
            query += ` WHERE p.customer_id = ${parseInt(req.query.customer_id)}`;
        }
        if (req.query.bill_id) {
            query += req.query.customer_id ? ' AND' : ' WHERE';
            query += ` p.bill_id = ${parseInt(req.query.bill_id)}`;
        }
        query += ' ORDER BY p.payment_date DESC';
        
        const result = db.exec(query);
        const payments = result[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
            notes: row[7],
            customer: row[8] ? { name: row[8] } : null,
            bill: row[9] ? { bill_number: row[9] } : null,
        })) || [];
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { customer_id, bill_id, payment_date, amount, payment_method, notes } = req.body;
        const db = await dbModule.getDb();
        const paymentNumber = 'PAY-' + uuidv4().substring(0, 8).toUpperCase();
        
        db.run(`INSERT INTO payments (customer_id, bill_id, payment_number, payment_date, amount, payment_method, notes) VALUES (${customer_id}, ${bill_id || 'NULL'}, '${paymentNumber}', '${payment_date}', ${amount}, '${payment_method || 'cash'}', ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'})`);
        
        // Update bill if linked
        if (bill_id) {
            const billResult = db.exec(`SELECT paid_amount, total_amount FROM bills WHERE id = ${bill_id}`);
            if (billResult[0]?.values.length) {
                const bill = billResult[0].values[0];
                const newPaidAmount = bill[0] + amount;
                const newDueAmount = Math.max(0, bill[1] - newPaidAmount);
                const status = newDueAmount === 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');
                db.run(`UPDATE bills SET paid_amount = ${newPaidAmount}, due_amount = ${newDueAmount}, status = '${status}' WHERE id = ${bill_id}`);
            }
        }
        
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, payment_number: paymentNumber, amount, payment_date });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM payments WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
            notes: row[7],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { payment_date, amount, payment_method, notes } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (payment_date !== undefined) updates.push(`payment_date = '${payment_date}'`);
        if (amount !== undefined) updates.push(`amount = ${amount}`);
        if (payment_method !== undefined) updates.push(`payment_method = '${payment_method}'`);
        if (notes !== undefined) updates.push(`notes = ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE payments SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Payment updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM payments WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
