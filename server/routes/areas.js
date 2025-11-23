import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec('SELECT a.*, GROUP_CONCAT(adb.delivery_boy_id) as delivery_boy_ids FROM areas a LEFT JOIN area_delivery_boy adb ON a.id = adb.area_id GROUP BY a.id ORDER BY a.name');
        const areas = result[0]?.values.map(row => ({
            id: row[0],
            name: row[1],
            code: row[2],
            description: row[3],
            is_active: row[4] === 1,
            created_at: row[5],
            updated_at: row[6],
        })) || [];
        res.json(areas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, code, description, is_active } = req.body;
        const db = await dbModule.getDb();
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
        db.run(`INSERT INTO areas (name, code, description, is_active) VALUES ('${name.replace(/'/g, "''")}', '${code.replace(/'/g, "''")}', ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}, ${isActive})`);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, name, code, description, is_active: isActive === 1 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM areas WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Area not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            name: row[1],
            code: row[2],
            description: row[3],
            is_active: row[4] === 1,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, code, description, is_active } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
        if (code !== undefined) updates.push(`code = '${code.replace(/'/g, "''")}'`);
        if (description !== undefined) updates.push(`description = ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}`);
        if (is_active !== undefined) updates.push(`is_active = ${is_active ? 1 : 0}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE areas SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Area updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM areas WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Area deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
