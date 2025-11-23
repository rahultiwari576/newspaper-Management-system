import React, { useState, useEffect } from 'react';

const PaymentModal = ({ payment, customers, bills, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        customer_id: '',
        bill_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        amount: '',
        payment_method: 'cash',
        notes: '',
    });

    const [filteredBills, setFilteredBills] = useState([]);

    useEffect(() => {
        if (payment) {
            setFormData({
                customer_id: payment.customer_id || '',
                bill_id: payment.bill_id || '',
                payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
                amount: payment.amount || '',
                payment_method: payment.payment_method || 'cash',
                notes: payment.notes || '',
            });
        }
    }, [payment]);

    useEffect(() => {
        if (formData.customer_id) {
            const customerBills = bills.filter(b => b.customer_id == formData.customer_id && b.due_amount > 0);
            setFilteredBills(customerBills);
        } else {
            setFilteredBills([]);
        }
    }, [formData.customer_id, bills]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            amount: parseFloat(formData.amount),
            bill_id: formData.bill_id || null,
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{payment ? 'Edit Payment' : 'Add Payment'}</h2>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Customer *</label>
                        <select
                            name="customer_id"
                            value={formData.customer_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Bill (Optional)</label>
                        <select
                            name="bill_id"
                            value={formData.bill_id}
                            onChange={handleChange}
                        >
                            <option value="">Select Bill (Optional)</option>
                            {filteredBills.map((bill) => (
                                <option key={bill.id} value={bill.id}>
                                    {bill.bill_number} - Due: ₹{parseFloat(bill.due_amount).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Payment Date *</label>
                        <input
                            type="date"
                            name="payment_date"
                            value={formData.payment_date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount *</label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Payment Method *</label>
                        <select
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleChange}
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="online">Online</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;

