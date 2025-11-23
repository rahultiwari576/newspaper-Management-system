import express from 'express';

export default function areasRouter(db) {
const router = express.Router();

    // Get all areas with delivery boys
router.get('/', (req, res) => {
    try {
            const areas = db.prepare('SELECT * FROM areas ORDER BY name').all();
            areas.forEach(area => {
                const deliveryBoys = db.prepare(`
                    SELECT d.* FROM delivery_boys d
                    INNER JOIN area_delivery_boy adb ON d.id = adb.delivery_boy_id
                    WHERE adb.area_id = ?
                `).all(area.id);
                area.delivery_boys = deliveryBoys;
            });
        res.json(areas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single area
router.get('/:id', (req, res) => {
    try {
        const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(req.params.id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
            
            const deliveryBoys = db.prepare(`
                SELECT d.* FROM delivery_boys d
                INNER JOIN area_delivery_boy adb ON d.id = adb.delivery_boy_id
                WHERE adb.area_id = ?
            `).all(area.id);
            area.delivery_boys = deliveryBoys;
            
            const customers = db.prepare('SELECT * FROM customers WHERE area_id = ?').all(area.id);
            area.customers = customers;
            
        res.json(area);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Create area
router.post('/', (req, res) => {
    try {
        const { name, code, description, is_active } = req.body;
            const result = db.prepare('INSERT INTO areas (name, code, description, is_active) VALUES (?, ?, ?, ?)')
                .run(name, code, description, is_active ?? 1);
        const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(area);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update area
router.put('/:id', (req, res) => {
    try {
        const { name, code, description, is_active } = req.body;
            db.prepare('UPDATE areas SET name = ?, code = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(name, code, description, is_active, req.params.id);
        const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(req.params.id);
            if (!area) return res.status(404).json({ error: 'Area not found' });
        res.json(area);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delete area
router.delete('/:id', (req, res) => {
    try {
            const result = db.prepare('DELETE FROM areas WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Area not found' });
        res.json({ message: 'Area deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Assign delivery boy to area
    router.post('/:id/assign-delivery-boy', (req, res) => {
        try {
            const { delivery_boy_id } = req.body;
            db.prepare('INSERT OR IGNORE INTO area_delivery_boy (area_id, delivery_boy_id) VALUES (?, ?)')
                .run(req.params.id, delivery_boy_id);
            res.json({ message: 'Delivery boy assigned successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
    
    return router;
}
