import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentBills, setRecentBills] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard');
            setStats(response.data.stats);
            setRecentBills(response.data.recent_bills);
            setRecentPayments(response.data.recent_payments);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Customers</h3>
                    <div className="value">{stats?.total_customers || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Areas</h3>
                    <div className="value">{stats?.total_areas || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Delivery Boys</h3>
                    <div className="value">{stats?.total_delivery_boys || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Active Papers</h3>
                    <div className="value">{stats?.total_papers || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Unpaid Bills</h3>
                    <div className="value">{stats?.unpaid_bills || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Due Amount</h3>
                    <div className="value">₹{parseFloat(stats?.total_due_amount || 0).toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Paid</h3>
                    <div className="value">₹{parseFloat(stats?.total_paid_amount || 0).toFixed(2)}</div>
                </div>
                <div className="stat-card">
                    <h3>Pending Bills</h3>
                    <div className="value">{stats?.pending_bills || 0}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card">
                    <h2>Recent Bills</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBills.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No bills found</td>
                                </tr>
                            ) : (
                                recentBills.map((bill) => (
                                    <tr key={bill.id}>
                                        <td>{bill.bill_number}</td>
                                        <td>{bill.customer?.name}</td>
                                        <td>₹{parseFloat(bill.total_amount).toFixed(2)}</td>
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

                <div className="card">
                    <h2>Recent Payments</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Payment #</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center' }}>No payments found</td>
                                </tr>
                            ) : (
                                recentPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.payment_number}</td>
                                        <td>{payment.customer?.name}</td>
                                        <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

