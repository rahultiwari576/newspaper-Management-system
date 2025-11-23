import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

// GET all papers
router.get('/', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec('SELECT * FROM papers ORDER BY name');
        if (!result || !result.length) {
            return res.json([]);
        }
        const papers = result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            price: row[2],
            type: row[3],
            is_active: row[4] === 1,
            created_at: row[5],
            updated_at: row[6],
        }));
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single paper
router.get('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        const result = db.exec(`SELECT * FROM papers WHERE id = ${parseInt(req.params.id)}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            name: row[1],
            price: row[2],
            type: row[3],
            is_active: row[4] === 1,
            created_at: row[5],
            updated_at: row[6],
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create paper
router.post('/', async (req, res) => {
    try {
        const { name, price, type, is_active } = req.body;
        const db = await dbModule.getDb();
        const isActive = is_active !== undefined ? (is_active ? 1 : 0) : 1;
        const paperType = type || 'daily';
        db.run(`INSERT INTO papers (name, price, type, is_active) VALUES ('${name.replace(/'/g, "''")}', ${price}, '${paperType}', ${isActive})`);
        const result = db.exec('SELECT last_insert_rowid() as id');
        const id = result[0].values[0][0];
        dbModule.saveDatabase();
        res.status(201).json({ id, name, price, type: paperType, is_active: isActive === 1 });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update paper
router.put('/:id', async (req, res) => {
    try {
        const { name, price, type, is_active } = req.body;
        const db = await dbModule.getDb();
        const updates = [];
        if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
        if (price !== undefined) updates.push(`price = ${price}`);
        if (type !== undefined) updates.push(`type = '${type}'`);
        if (is_active !== undefined) updates.push(`is_active = ${is_active ? 1 : 0}`);
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        db.run(`UPDATE papers SET ${updates.join(', ')} WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        
        const result = db.exec(`SELECT * FROM papers WHERE id = ${req.params.id}`);
        if (!result || !result.length || !result[0].values.length) {
            return res.status(404).json({ error: 'Paper not found' });
        }
        const row = result[0].values[0];
        res.json({
            id: row[0],
            name: row[1],
            price: row[2],
            type: row[3],
            is_active: row[4] === 1,
            created_at: row[5],
            updated_at: row[6],
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE paper
router.delete('/:id', async (req, res) => {
    try {
        const db = await dbModule.getDb();
        db.run(`DELETE FROM papers WHERE id = ${parseInt(req.params.id)}`);
        dbModule.saveDatabase();
        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
