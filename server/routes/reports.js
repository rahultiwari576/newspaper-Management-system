import express from 'express';

export default function reportsRouter(db) {
const router = express.Router();

    // Customer report
router.get('/customer', (req, res) => {
    try {
        const { customer_id, year, month } = req.query;
            if (!customer_id) return res.status(400).json({ error: 'customer_id is required' });
            
        const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(customer_id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

            customer.area = db.prepare('SELECT * FROM areas WHERE id = ?').get(customer.area_id);
            if (customer.delivery_boy_id) {
                customer.delivery_boy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(customer.delivery_boy_id);
            }
            
            const subscriptions = db.prepare(`
                SELECT s.*, p.name as paper_name, p.price, p.type
                FROM subscriptions s
                INNER JOIN papers p ON s.paper_id = p.id
                WHERE s.customer_id = ?
            `).all(customer_id);
            customer.subscriptions = subscriptions;
            
            let billsQuery = 'SELECT * FROM bills WHERE customer_id = ?';
            const billsParams = [customer_id];

            if (year && month) {
                billsQuery += ' AND strftime("%Y", bill_date) = ? AND strftime("%m", bill_date) = ?';
                billsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                billsQuery += ' AND strftime("%Y", bill_date) = ?';
                billsParams.push(year);
            }
            
            billsQuery += ' ORDER BY bill_date DESC';
            
            const bills = db.prepare(billsQuery).all(...billsParams);
            bills.forEach(bill => {
                const items = db.prepare(`
                    SELECT bi.*, p.name as paper_name, p.type
                    FROM bill_items bi
                    INNER JOIN papers p ON bi.paper_id = p.id
                    WHERE bi.bill_id = ?
                `).all(bill.id);
                bill.items = items;
            });
            
            let paymentsQuery = 'SELECT * FROM payments WHERE customer_id = ?';
            const paymentsParams = [customer_id];
            
            if (year && month) {
                paymentsQuery += ' AND strftime("%Y", payment_date) = ? AND strftime("%m", payment_date) = ?';
                paymentsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                paymentsQuery += ' AND strftime("%Y", payment_date) = ?';
                paymentsParams.push(year);
            }
            
            paymentsQuery += ' ORDER BY payment_date DESC';
            
            const payments = db.prepare(paymentsQuery).all(...paymentsParams);
            payments.forEach(payment => {
                if (payment.bill_id) {
                    payment.bill = db.prepare('SELECT bill_number FROM bills WHERE id = ?').get(payment.bill_id);
                }
            });

            const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = totalBilled - totalPaid;

        res.json({
            customer,
            bills,
            payments,
            summary: {
                total_billed: totalBilled,
                total_paid: totalPaid,
                total_due: totalDue,
                bill_count: bills.length,
                payment_count: payments.length,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Area report
router.get('/area', (req, res) => {
    try {
        const { area_id, year, month } = req.query;
            if (!area_id) return res.status(400).json({ error: 'area_id is required' });
            
        const area = db.prepare('SELECT * FROM areas WHERE id = ?').get(area_id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
            
            const deliveryBoys = db.prepare(`
                SELECT d.* FROM delivery_boys d
                INNER JOIN area_delivery_boy adb ON d.id = adb.delivery_boy_id
                WHERE adb.area_id = ?
            `).all(area_id);
            area.delivery_boys = deliveryBoys;

        const customerIds = db.prepare('SELECT id FROM customers WHERE area_id = ?').all(area_id).map(c => c.id);
            const customerCount = customerIds.length;
            
        if (customerIds.length === 0) {
                return res.json({
                    area,
                    customer_count: 0,
                    bills: [],
                    payments: [],
                    summary: { total_billed: 0, total_paid: 0, total_due: 0, bill_count: 0, payment_count: 0 },
                });
        }

            let billsQuery = `SELECT b.*, c.name as customer_name FROM bills b INNER JOIN customers c ON b.customer_id = c.id WHERE b.customer_id IN (${customerIds.map(() => '?').join(',')})`;
            const billsParams = [...customerIds];

            if (year && month) {
                billsQuery += ' AND strftime("%Y", b.bill_date) = ? AND strftime("%m", b.bill_date) = ?';
                billsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                billsQuery += ' AND strftime("%Y", b.bill_date) = ?';
                billsParams.push(year);
            }
            
            billsQuery += ' ORDER BY b.bill_date DESC';

            const bills = db.prepare(billsQuery).all(...billsParams);
            bills.forEach(bill => {
                bill.customer = { name: bill.customer_name };
                const items = db.prepare(`
                    SELECT bi.*, p.name as paper_name, p.type
                    FROM bill_items bi
                    INNER JOIN papers p ON bi.paper_id = p.id
                    WHERE bi.bill_id = ?
                `).all(bill.id);
                bill.items = items;
            });
            
            let paymentsQuery = `SELECT p.*, c.name as customer_name FROM payments p INNER JOIN customers c ON p.customer_id = c.id WHERE p.customer_id IN (${customerIds.map(() => '?').join(',')})`;
            const paymentsParams = [...customerIds];
            
            if (year && month) {
                paymentsQuery += ' AND strftime("%Y", p.payment_date) = ? AND strftime("%m", p.payment_date) = ?';
                paymentsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                paymentsQuery += ' AND strftime("%Y", p.payment_date) = ?';
                paymentsParams.push(year);
            }
            
            paymentsQuery += ' ORDER BY p.payment_date DESC';
            
            const payments = db.prepare(paymentsQuery).all(...paymentsParams);
            payments.forEach(payment => {
                payment.customer = { name: payment.customer_name };
                if (payment.bill_id) {
                    payment.bill = db.prepare('SELECT bill_number FROM bills WHERE id = ?').get(payment.bill_id);
                }
            });

            const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = totalBilled - totalPaid;

        res.json({
            area,
                customer_count: customerCount,
            bills,
            payments,
            summary: {
                total_billed: totalBilled,
                total_paid: totalPaid,
                total_due: totalDue,
                bill_count: bills.length,
                payment_count: payments.length,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    // Delivery boy report
router.get('/delivery-boy', (req, res) => {
    try {
        const { delivery_boy_id, year, month } = req.query;
            if (!delivery_boy_id) return res.status(400).json({ error: 'delivery_boy_id is required' });
            
        const deliveryBoy = db.prepare('SELECT * FROM delivery_boys WHERE id = ?').get(delivery_boy_id);
        if (!deliveryBoy) return res.status(404).json({ error: 'Delivery boy not found' });
            
            const areas = db.prepare(`
                SELECT a.* FROM areas a
                INNER JOIN area_delivery_boy adb ON a.id = adb.area_id
                WHERE adb.delivery_boy_id = ?
            `).all(delivery_boy_id);
            deliveryBoy.areas = areas;

        const customerIds = db.prepare('SELECT id FROM customers WHERE delivery_boy_id = ?').all(delivery_boy_id).map(c => c.id);
            const customerCount = customerIds.length;
            
        if (customerIds.length === 0) {
                return res.json({
                    delivery_boy: deliveryBoy,
                    customer_count: 0,
                    bills: [],
                    payments: [],
                    summary: { total_billed: 0, total_paid: 0, total_due: 0, bill_count: 0, payment_count: 0 },
                });
        }

            let billsQuery = `SELECT b.*, c.name as customer_name FROM bills b INNER JOIN customers c ON b.customer_id = c.id WHERE b.customer_id IN (${customerIds.map(() => '?').join(',')})`;
            const billsParams = [...customerIds];

            if (year && month) {
                billsQuery += ' AND strftime("%Y", b.bill_date) = ? AND strftime("%m", b.bill_date) = ?';
                billsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                billsQuery += ' AND strftime("%Y", b.bill_date) = ?';
                billsParams.push(year);
            }
            
            billsQuery += ' ORDER BY b.bill_date DESC';

            const bills = db.prepare(billsQuery).all(...billsParams);
            bills.forEach(bill => {
                bill.customer = { name: bill.customer_name };
                const items = db.prepare(`
                    SELECT bi.*, p.name as paper_name, p.type
                    FROM bill_items bi
                    INNER JOIN papers p ON bi.paper_id = p.id
                    WHERE bi.bill_id = ?
                `).all(bill.id);
                bill.items = items;
            });
            
            let paymentsQuery = `SELECT p.*, c.name as customer_name FROM payments p INNER JOIN customers c ON p.customer_id = c.id WHERE p.customer_id IN (${customerIds.map(() => '?').join(',')})`;
            const paymentsParams = [...customerIds];
            
            if (year && month) {
                paymentsQuery += ' AND strftime("%Y", p.payment_date) = ? AND strftime("%m", p.payment_date) = ?';
                paymentsParams.push(year, String(month).padStart(2, '0'));
            } else if (year) {
                paymentsQuery += ' AND strftime("%Y", p.payment_date) = ?';
                paymentsParams.push(year);
            }
            
            paymentsQuery += ' ORDER BY p.payment_date DESC';
            
            const payments = db.prepare(paymentsQuery).all(...paymentsParams);
            payments.forEach(payment => {
                payment.customer = { name: payment.customer_name };
                if (payment.bill_id) {
                    payment.bill = db.prepare('SELECT bill_number FROM bills WHERE id = ?').get(payment.bill_id);
                }
            });

            const totalBilled = bills.reduce((sum, b) => sum + b.total_amount, 0);
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalDue = totalBilled - totalPaid;

        res.json({
            delivery_boy: deliveryBoy,
                customer_count: customerCount,
            bills,
            payments,
            summary: {
                total_billed: totalBilled,
                total_paid: totalPaid,
                total_due: totalDue,
                bill_count: bills.length,
                payment_count: payments.length,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

    return router;
}
