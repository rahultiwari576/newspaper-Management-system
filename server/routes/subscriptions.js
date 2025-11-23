import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec('SELECT * FROM subscriptions ORDER BY created_at DESC');
        const subscriptions = result[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            paper_id: row[2],
            start_date: row[3],
            end_date: row[4],
            is_active: row[5] === 1,
        })) || [];
        res.json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { customer_id, paper_id, start_date, end_date, is_active } = req.body;
        const db = await dbModule.getDb();
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
        db.run(`INSERT INTO subscriptions (customer_id, paper_id, start_date, end_date, is_active) VALUES (${customer_id}, ${paper_id}, '${start_date}', ${end_date ? `'${end_date}'` : 'NULL'}, ${isActive})`);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, customer_id, paper_id, start_date, end_date, is_active: isActive === 1 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM subscriptions WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Subscription not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            customer_id: row[1],
            paper_id: row[2],
            start_date: row[3],
            end_date: row[4],
            is_active: row[5] === 1,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { customer_id, paper_id, start_date, end_date, is_active } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (customer_id !== undefined) updates.push(`customer_id = ${customer_id}`);
        if (paper_id !== undefined) updates.push(`paper_id = ${paper_id}`);
        if (start_date !== undefined) updates.push(`start_date = '${start_date}'`);
        if (end_date !== undefined) updates.push(`end_date = ${end_date ? `'${end_date}'` : 'NULL'}`);
        if (is_active !== undefined) updates.push(`is_active = ${is_active ? 1 : 0}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE subscriptions SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Subscription updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM subscriptions WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Subscription deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
