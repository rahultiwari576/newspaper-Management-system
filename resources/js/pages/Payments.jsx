import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import PaymentModal from '../components/PaymentModal';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
        fetchCustomers();
        fetchBills();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await api.get('/payments');
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchBills = async () => {
        try {
            const response = await api.get('/bills');
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    const handleAdd = () => {
        setEditingPayment(null);
        setModalOpen(true);
    };

    const handleEdit = (payment) => {
        setEditingPayment(payment);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await api.delete(`/payments/${id}`);
                fetchPayments();
                fetchBills();
            } catch (error) {
                console.error('Error deleting payment:', error);
                alert('Error deleting payment');
            }
        }
    };

    const handleSave = async (paymentData) => {
        try {
            if (editingPayment) {
                await api.put(`/payments/${editingPayment.id}`, paymentData);
            } else {
                await api.post('/payments', paymentData);
            }
            setModalOpen(false);
            fetchPayments();
            fetchBills();
        } catch (error) {
            console.error('Error saving payment:', error);
            alert('Error saving payment');
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Payments</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Payment
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Payment #</th>
                            <th>Customer</th>
                            <th>Bill #</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No payments found</td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td>{payment.payment_number}</td>
                                    <td>{payment.customer?.name}</td>
                                    <td>{payment.bill?.bill_number || '-'}</td>
                                    <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                                    <td>{payment.payment_method}</td>
                                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(payment)} style={{ marginRight: '5px' }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(payment.id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <PaymentModal
                    payment={editingPayment}
                    customers={customers}
                    bills={bills}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Payments;

