import express from 'express';

export default function papersRouter(db) {
const router = express.Router();

    // Get all papers
router.get('/', (req, res) => {
    try {
        const papers = db.prepare('SELECT * FROM papers ORDER BY name').all();
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single paper
router.get('/:id', (req, res) => {
    try {
        const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id);
            if (!paper) return res.status(404).json({ error: 'Paper not found' });
        res.json(paper);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Create paper
router.post('/', (req, res) => {
    try {
        const { name, price, type, is_active } = req.body;
            const result = db.prepare('INSERT INTO papers (name, price, type, is_active) VALUES (?, ?, ?, ?)')
                .run(name, price, type, is_active ?? 1);
        const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(paper);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update paper
router.put('/:id', (req, res) => {
    try {
        const { name, price, type, is_active } = req.body;
            db.prepare('UPDATE papers SET name = ?, price = ?, type = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(name, price, type, is_active, req.params.id);
        const paper = db.prepare('SELECT * FROM papers WHERE id = ?').get(req.params.id);
            if (!paper) return res.status(404).json({ error: 'Paper not found' });
        res.json(paper);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delete paper
router.delete('/:id', (req, res) => {
    try {
            const result = db.prepare('DELETE FROM papers WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Paper not found' });
        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
