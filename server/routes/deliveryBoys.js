import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec('SELECT * FROM delivery_boys ORDER BY name');
        const deliveryBoys = result[0]?.values.map(row => ({
            id: row[0],
            name: row[1],
            phone: row[2],
            email: row[3],
            address: row[4],
            is_active: row[5] === 1,
        })) || [];
        res.json(deliveryBoys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, phone, email, address, is_active } = req.body;
        const db = await dbModule.getDb();
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
        db.run(`INSERT INTO delivery_boys (name, phone, email, address, is_active) VALUES ('${name.replace(/'/g, "''")}', '${phone}', ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}, ${address ? `'${address.replace(/'/g, "''")}'` : 'NULL'}, ${isActive})`);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, name, phone, email, address, is_active: isActive === 1 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM delivery_boys WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Delivery boy not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            name: row[1],
            phone: row[2],
            email: row[3],
            address: row[4],
            is_active: row[5] === 1,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, address, is_active } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
        if (phone !== undefined) updates.push(`phone = '${phone}'`);
        if (email !== undefined) updates.push(`email = ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}`);
        if (address !== undefined) updates.push(`address = ${address ? `'${address.replace(/'/g, "''")}'` : 'NULL'}`);
        if (is_active !== undefined) updates.push(`is_active = ${is_active ? 1 : 0}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE delivery_boys SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Delivery boy updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM delivery_boys WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Delivery boy deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
