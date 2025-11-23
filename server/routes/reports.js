import express from 'express';
import dbModule from '../database/db.js';

const router = express.Router();

router.get('/customer', async (req, res) => {
    try {
        const { customer_id, year, month } = req.query;
        if (!customer_id) {
            return res.status(400).json({ error: 'customer_id is required' });
        }
        
        const db = await dbModule.getDb();
        
        // Get customer
        const customerResult = db.exec(`SELECT c.*, a.name as area_name, db.name as delivery_boy_name FROM customers c LEFT JOIN areas a ON c.area_id = a.id LEFT JOIN delivery_boys db ON c.delivery_boy_id = db.id WHERE c.id = ${parseInt(customer_id)}`);
        if (!customerResult[0]?.values.length) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        const custRow = customerResult[0].values[0];
        const customer = {
            id: custRow[0],
            name: custRow[1],
            phone: custRow[2],
            email: custRow[3],
            address: custRow[4],
            area: custRow[8] ? { name: custRow[8] } : null,
            delivery_boy: custRow[9] ? { name: custRow[9] } : null,
        };
        
        // Get bills
        let billQuery = `SELECT * FROM bills WHERE customer_id = ${parseInt(customer_id)}`;
        if (year) {
            billQuery += ` AND strftime('%Y', bill_date) = '${year}'`;
            if (month) {
                billQuery += ` AND strftime('%m', bill_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        billQuery += ' ORDER BY bill_date DESC';
        
        const billsResult = db.exec(billQuery);
        const bills = billsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_number: row[2],
            bill_date: row[3],
            period_start: row[4],
            period_end: row[5],
            total_days: row[6],
            subtotal: row[7],
            total_amount: row[8],
            paid_amount: row[9],
            due_amount: row[10],
            status: row[11],
        })) || [];
        
        // Get payments
        let paymentQuery = `SELECT * FROM payments WHERE customer_id = ${parseInt(customer_id)}`;
        if (year) {
            paymentQuery += ` AND strftime('%Y', payment_date) = '${year}'`;
            if (month) {
                paymentQuery += ` AND strftime('%m', payment_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        paymentQuery += ' ORDER BY payment_date DESC';
        
        const paymentsResult = db.exec(paymentQuery);
        const payments = paymentsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
        })) || [];
        
        const totalBilled = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
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

router.get('/area', async (req, res) => {
    try {
        const { area_id, year, month } = req.query;
        if (!area_id) {
            return res.status(400).json({ error: 'area_id is required' });
        }
        
        const db = await dbModule.getDb();
        
        // Get area
        const areaResult = db.exec(`SELECT * FROM areas WHERE id = ${parseInt(area_id)}`);
        if (!areaResult[0]?.values.length) {
            return res.status(404).json({ error: 'Area not found' });
        }
        const areaRow = areaResult[0].values[0];
        const area = {
            id: areaRow[0],
            name: areaRow[1],
            code: areaRow[2],
            description: areaRow[3],
        };
        
        // Get customer IDs in this area
        const customersResult = db.exec(`SELECT id FROM customers WHERE area_id = ${parseInt(area_id)}`);
        const customerIds = customersResult[0]?.values.map(row => row[0]) || [];
        
        if (customerIds.length === 0) {
            return res.json({
                area,
                customer_count: 0,
                bills: [],
                payments: [],
                summary: { total_billed: 0, total_paid: 0, total_due: 0, bill_count: 0, payment_count: 0 },
            });
        }
        
        // Get bills
        let billQuery = `SELECT * FROM bills WHERE customer_id IN (${customerIds.join(',')})`;
        if (year) {
            billQuery += ` AND strftime('%Y', bill_date) = '${year}'`;
            if (month) {
                billQuery += ` AND strftime('%m', bill_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        billQuery += ' ORDER BY bill_date DESC';
        
        const billsResult = db.exec(billQuery);
        const bills = billsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_number: row[2],
            bill_date: row[3],
            period_start: row[4],
            period_end: row[5],
            total_days: row[6],
            subtotal: row[7],
            total_amount: row[8],
            paid_amount: row[9],
            due_amount: row[10],
            status: row[11],
        })) || [];
        
        // Get payments
        let paymentQuery = `SELECT * FROM payments WHERE customer_id IN (${customerIds.join(',')})`;
        if (year) {
            paymentQuery += ` AND strftime('%Y', payment_date) = '${year}'`;
            if (month) {
                paymentQuery += ` AND strftime('%m', payment_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        paymentQuery += ' ORDER BY payment_date DESC';
        
        const paymentsResult = db.exec(paymentQuery);
        const payments = paymentsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
        })) || [];
        
        const totalBilled = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalDue = totalBilled - totalPaid;
        
        res.json({
            area,
            customer_count: customerIds.length,
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

router.get('/delivery-boy', async (req, res) => {
    try {
        const { delivery_boy_id, year, month } = req.query;
        if (!delivery_boy_id) {
            return res.status(400).json({ error: 'delivery_boy_id is required' });
        }
        
        const db = await dbModule.getDb();
        
        // Get delivery boy
        const dbResult = db.exec(`SELECT * FROM delivery_boys WHERE id = ${parseInt(delivery_boy_id)}`);
        if (!dbResult[0]?.values.length) {
            return res.status(404).json({ error: 'Delivery boy not found' });
        }
        const dbRow = dbResult[0].values[0];
        const deliveryBoy = {
            id: dbRow[0],
            name: dbRow[1],
            phone: dbRow[2],
            email: dbRow[3],
            address: dbRow[4],
        };
        
        // Get customer IDs for this delivery boy
        const customersResult = db.exec(`SELECT id FROM customers WHERE delivery_boy_id = ${parseInt(delivery_boy_id)}`);
        const customerIds = customersResult[0]?.values.map(row => row[0]) || [];
        
        if (customerIds.length === 0) {
            return res.json({
                delivery_boy: deliveryBoy,
                customer_count: 0,
                bills: [],
                payments: [],
                summary: { total_billed: 0, total_paid: 0, total_due: 0, bill_count: 0, payment_count: 0 },
            });
        }
        
        // Get bills
        let billQuery = `SELECT * FROM bills WHERE customer_id IN (${customerIds.join(',')})`;
        if (year) {
            billQuery += ` AND strftime('%Y', bill_date) = '${year}'`;
            if (month) {
                billQuery += ` AND strftime('%m', bill_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        billQuery += ' ORDER BY bill_date DESC';
        
        const billsResult = db.exec(billQuery);
        const bills = billsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_number: row[2],
            bill_date: row[3],
            period_start: row[4],
            period_end: row[5],
            total_days: row[6],
            subtotal: row[7],
            total_amount: row[8],
            paid_amount: row[9],
            due_amount: row[10],
            status: row[11],
        })) || [];
        
        // Get payments
        let paymentQuery = `SELECT * FROM payments WHERE customer_id IN (${customerIds.join(',')})`;
        if (year) {
            paymentQuery += ` AND strftime('%Y', payment_date) = '${year}'`;
            if (month) {
                paymentQuery += ` AND strftime('%m', payment_date) = '${String(month).padStart(2, '0')}'`;
            }
        }
        paymentQuery += ' ORDER BY payment_date DESC';
        
        const paymentsResult = db.exec(paymentQuery);
        const payments = paymentsResult[0]?.values.map(row => ({
            id: row[0],
            customer_id: row[1],
            bill_id: row[2],
            payment_number: row[3],
            payment_date: row[4],
            amount: row[5],
            payment_method: row[6],
        })) || [];
        
        const totalBilled = bills.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalDue = totalBilled - totalPaid;
        
        res.json({
            delivery_boy: deliveryBoy,
            customer_count: customerIds.length,
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

export default router;
