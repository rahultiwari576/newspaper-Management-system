import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import BillModal from '../components/BillModal';

const Bills = () => {
    const [bills, setBills] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [generateModalOpen, setGenerateModalOpen] = useState(false);

    useEffect(() => {
        fetchBills();
        fetchCustomers();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await api.get('/bills');
            setBills(response.data);
        } catch (error) {
            console.error('Error fetching bills:', error);
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

    const handleGenerate = () => {
        setGenerateModalOpen(true);
    };

    const handleGenerateMonthly = async (year, month) => {
        try {
            await api.post('/bills/generate-monthly', { year, month });
            setGenerateModalOpen(false);
            fetchBills();
            alert('Bills generated successfully!');
        } catch (error) {
            console.error('Error generating bills:', error);
            alert('Error generating bills');
        }
    };

    const handleAdd = () => {
        setModalOpen(true);
    };

    const handleSave = async (billData) => {
        try {
            await api.post('/bills', billData);
            setModalOpen(false);
            fetchBills();
        } catch (error) {
            console.error('Error saving bill:', error);
            alert('Error saving bill: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Bills</h1>
                <div>
                    <button className="btn btn-success" onClick={handleGenerate} style={{ marginRight: '10px' }}>
                        Generate Monthly Bills
                    </button>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        Generate Bill
                    </button>
                </div>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Bill #</th>
                            <th>Customer</th>
                            <th>Period</th>
                            <th>Total Days</th>
                            <th>Total Amount</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bills.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>No bills found</td>
                            </tr>
                        ) : (
                            bills.map((bill) => (
                                <tr key={bill.id}>
                                    <td>{bill.bill_number}</td>
                                    <td>{bill.customer?.name}</td>
                                    <td>
                                        {new Date(bill.period_start).toLocaleDateString()} - {new Date(bill.period_end).toLocaleDateString()}
                                    </td>
                                    <td>{bill.total_days}</td>
                                    <td>₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                                    <td>₹{parseFloat(bill.paid_amount).toFixed(2)}</td>
                                    <td>₹{parseFloat(bill.due_amount).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge badge-${bill.status === 'paid' ? 'success' : bill.status === 'partial' ? 'warning' : 'danger'}`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <BillModal
                    customers={customers}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {generateModalOpen && (
                <GenerateMonthlyModal
                    onGenerate={handleGenerateMonthly}
                    onClose={() => setGenerateModalOpen(false)}
                />
            )}
        </div>
    );
};

const GenerateMonthlyModal = ({ onGenerate, onClose }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        onGenerate(year, month);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Generate Monthly Bills</h2>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Year *</label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                            min="2020"
                            max="2100"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Month *</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                            required
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                                <option key={m} value={m}>
                                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Generate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Bills;

