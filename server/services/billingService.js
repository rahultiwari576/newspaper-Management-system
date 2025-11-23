export function generateBill(db, customerId, periodStart, periodEnd, notes = null) {
  // Get customer subscriptions
  const subscriptions = db.prepare(`
    SELECT s.*, p.price, p.type
    FROM subscriptions s
    JOIN papers p ON s.paper_id = p.id
    WHERE s.customer_id = ? AND s.is_active = 1
  `).all(customerId);

  if (subscriptions.length === 0) {
    throw new Error('No active subscriptions found for this customer');
  }

  // Generate bill number
  const billNumber = 'BILL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Calculate total days
  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  // Create bill
  const billResult = db.prepare(`
    INSERT INTO bills (customer_id, bill_number, bill_date, period_start, period_end, total_days, notes, status)
    VALUES (?, ?, date('now'), ?, ?, ?, ?, 'pending')
  `).run(customerId, billNumber, periodStart, periodEnd, totalDays, notes);

  const billId = billResult.lastInsertRowid;
  let subtotal = 0;

  // Create bill items
  for (const subscription of subscriptions) {
    const subStart = new Date(subscription.start_date);
    const subEnd = subscription.end_date ? new Date(subscription.end_date) : endDate;
    const periodStartDate = startDate;
    const periodEndDate = endDate;

    // Calculate overlapping days
    const effectiveStart = subStart > periodStartDate ? subStart : periodStartDate;
    const effectiveEnd = subEnd < periodEndDate ? subEnd : periodEndDate;

    if (effectiveStart > effectiveEnd) {
      continue;
    }

    const days = Math.ceil((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)) + 1;

    // Calculate amount
    let amount;
    if (subscription.type === 'weekly') {
      const weeks = Math.ceil(days / 7);
      amount = weeks * parseFloat(subscription.price);
    } else {
      amount = days * parseFloat(subscription.price);
    }

    db.prepare(`
      INSERT INTO bill_items (bill_id, paper_id, days, rate, amount)
      VALUES (?, ?, ?, ?, ?)
    `).run(billId, subscription.paper_id, days, subscription.price, amount);

    subtotal += amount;
  }

  // Update bill totals
  db.prepare(`
    UPDATE bills 
    SET subtotal = ?, total_amount = ?, due_amount = ?
    WHERE id = ?
  `).run(subtotal, subtotal, subtotal, billId);

  // Get complete bill with items
  const bill = db.prepare('SELECT * FROM bills WHERE id = ?').get(billId);
  const items = db.prepare(`
    SELECT bi.*, p.name as paper_name
    FROM bill_items bi
    LEFT JOIN papers p ON bi.paper_id = p.id
    WHERE bi.bill_id = ?
  `).all(billId);

  return { ...bill, items };
}

