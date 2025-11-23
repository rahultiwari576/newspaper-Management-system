import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`
            SELECT c.*, a.name as area_name, db.name as delivery_boy_name 
            FROM customers c 
            LEFT JOIN areas a ON c.area_id = a.id 
            LEFT JOIN delivery_boys db ON c.delivery_boy_id = db.id 
            ORDER BY c.name
        `);
        const customers = result[0]?.values.map(row => ({
            id: row[0],
            name: row[1],
            phone: row[2],
            email: row[3],
            address: row[4],
            area_id: row[5],
            delivery_boy_id: row[6],
            is_active: row[7] === 1,
            area: row[8] ? { name: row[8] } : null,
            delivery_boy: row[9] ? { name: row[9] } : null,
        })) || [];
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, area_id, delivery_boy_id, is_active } = req.body;
        const db = await dbModule.getDb();
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
        db.run(`INSERT INTO customers (name, phone, email, address, area_id, delivery_boy_id, is_active) VALUES ('${name.replace(/'/g, "''")}', '${phone}', ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}, '${address.replace(/'/g, "''")}', ${area_id}, ${delivery_boy_id || 'NULL'}, ${isActive})`);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, name, phone, email, address, area_id, delivery_boy_id, is_active: isActive === 1 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM customers WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            name: row[1],
            phone: row[2],
            email: row[3],
            address: row[4],
            area_id: row[5],
            delivery_boy_id: row[6],
            is_active: row[7] === 1,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, address, area_id, delivery_boy_id, is_active } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
        if (phone !== undefined) updates.push(`phone = '${phone}'`);
        if (email !== undefined) updates.push(`email = ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}`);
        if (address !== undefined) updates.push(`address = '${address.replace(/'/g, "''")}'`);
        if (area_id !== undefined) updates.push(`area_id = ${area_id}`);
        if (delivery_boy_id !== undefined) updates.push(`delivery_boy_id = ${delivery_boy_id || 'NULL'}`);
        if (is_active !== undefined) updates.push(`is_active = ${is_active ? 1 : 0}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE customers SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM customers WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
