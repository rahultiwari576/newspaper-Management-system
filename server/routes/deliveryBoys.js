import express from 'express';

export default function deliveryBoysRouter(db) {
const router = express.Router();

    // Get all delivery boys with areas
router.get('/', (req, res) => {
    try {
        const deliveryBoys = db.prepare('SELECT * FROM delivery_boys ORDER BY name').all();
            deliveryBoys.forEach(db => {
                const areas = db.prepare(`
                    SELECT a.* FROM areas a
                    INNER JOIN area_delivery_boy adb ON a.id = adb.area_id
                    WHERE adb.delivery_boy_id = ?
                `).all(db.id);
                db.areas = areas;
            });
        res.json(deliveryBoys);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Get single delivery boy
router.get('/:id', (req, res) => {
    try {
            const deliveryBoy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(req.params.id);
            if (!deliveryBoy) return res.status(404).json({ error: 'Delivery boy not found' });
            
            const areas = db.prepare(`
                SELECT a.* FROM areas a
                INNER JOIN area_delivery_boy adb ON a.id = adb.area_id
                WHERE adb.delivery_boy_id = ?
            `).all(deliveryBoy.id);
            deliveryBoy.areas = areas;
            
            const customers = db.prepare('SELECT * FROM customers WHERE delivery_boy_id = ?').all(deliveryBoy.id);
            deliveryBoy.customers = customers;
            
            res.json(deliveryBoy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Create delivery boy
router.post('/', (req, res) => {
    try {
        const { name, phone, email, address, is_active } = req.body;
            const result = db.prepare('INSERT INTO delivery_boys (name, phone, email, address, is_active) VALUES (?, ?, ?, ?, ?)')
                .run(name, phone, email, address, is_active ?? 1);
            const deliveryBoy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(result.lastInsertRowid);
            res.status(201).json(deliveryBoy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Update delivery boy
router.put('/:id', (req, res) => {
    try {
        const { name, phone, email, address, is_active } = req.body;
            db.prepare('UPDATE delivery_boys SET name = ?, phone = ?, email = ?, address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(name, phone, email, address, is_active, req.params.id);
            const deliveryBoy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(req.params.id);
            if (!deliveryBoy) return res.status(404).json({ error: 'Delivery boy not found' });
            res.json(deliveryBoy);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delete delivery boy
router.delete('/:id', (req, res) => {
    try {
            const result = db.prepare('DELETE FROM delivery_boys WHERE id = ?').run(req.params.id);
            if (result.changes === 0) return res.status(404).json({ error: 'Delivery boy not found' });
        res.json({ message: 'Delivery boy deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
