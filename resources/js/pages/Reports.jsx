import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Reports = () => {
    const [reportType, setReportType] = useState('customer');
    const [customers, setCustomers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const [customersRes, areasRes, deliveryBoysRes] = await Promise.all([
                api.get('/customers'),
                api.get('/areas'),
                api.get('/delivery-boys'),
            ]);
            setCustomers(customersRes.data);
            setAreas(areasRes.data);
            setDeliveryBoys(deliveryBoysRes.data);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleGenerate = async () => {
        if (!selectedId) {
            alert('Please select an option');
            return;
        }

        setLoading(true);
        try {
            const params = { [reportType === 'customer' ? 'customer_id' : reportType === 'area' ? 'area_id' : 'delivery_boy_id']: selectedId };
            if (year) params.year = year;
            if (month) params.month = month;

            const endpoint = reportType === 'customer' ? '/reports/customer' : reportType === 'area' ? '/reports/area' : '/reports/delivery-boy';
            const response = await api.get(endpoint, { params });
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const getOptions = () => {
        if (reportType === 'customer') return customers;
        if (reportType === 'area') return areas;
        return deliveryBoys;
    };

    return (
        <div className="container">
            <h1>Reports</h1>

            <div className="card">
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ marginRight: '10px' }}>Report Type:</label>
                    <select
                        value={reportType}
                        onChange={(e) => {
                            setReportType(e.target.value);
                            setSelectedId('');
                            setReportData(null);
                        }}
                        style={{ padding: '8px', marginRight: '20px' }}
                    >
                        <option value="customer">Customer Report</option>
                        <option value="area">Area Report</option>
                        <option value="delivery-boy">Delivery Boy Report</option>
                    </select>

                    <label style={{ marginRight: '10px' }}>Select:</label>
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        style={{ padding: '8px', marginRight: '20px' }}
                    >
                        <option value="">Select {reportType === 'customer' ? 'Customer' : reportType === 'area' ? 'Area' : 'Delivery Boy'}</option>
                        {getOptions().map((option) => (
                            <option key={option.id} value={option.id}>
                                {option.name}
                            </option>
                        ))}
                    </select>

                    <label style={{ marginRight: '10px' }}>Year:</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        min="2020"
                        max="2100"
                        style={{ padding: '8px', marginRight: '20px', width: '100px' }}
                    />

                    <label style={{ marginRight: '10px' }}>Month (Optional):</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        style={{ padding: '8px', marginRight: '20px' }}
                    >
                        <option value="">All Months</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                            <option key={m} value={m}>
                                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                            </option>
                        ))}
                    </select>

                    <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {reportData && (
                <div className="card">
                    <h2>
                        {reportType === 'customer' ? 'Customer' : reportType === 'area' ? 'Area' : 'Delivery Boy'} Report
                    </h2>
                    <div style={{ marginBottom: '20px' }}>
                        <h3>
                            {reportType === 'customer'
                                ? reportData.customer?.name
                                : reportType === 'area'
                                ? reportData.area?.name
                                : reportData.delivery_boy?.name}
                        </h3>
                        {reportData.summary && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                                <div>
                                    <strong>Total Billed:</strong> ₹{parseFloat(reportData.summary.total_billed).toFixed(2)}
                                </div>
                                <div>
                                    <strong>Total Paid:</strong> ₹{parseFloat(reportData.summary.total_paid).toFixed(2)}
                                </div>
                                <div>
                                    <strong>Total Due:</strong> ₹{parseFloat(reportData.summary.total_due).toFixed(2)}
                                </div>
                                <div>
                                    <strong>Bill Count:</strong> {reportData.summary.bill_count}
                                </div>
                                <div>
                                    <strong>Payment Count:</strong> {reportData.summary.payment_count}
                                </div>
                            </div>
                        )}
                    </div>

                    <h3>Bills</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Bill #</th>
                                <th>Date</th>
                                <th>Period</th>
                                <th>Amount</th>
                                <th>Paid</th>
                                <th>Due</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.bills?.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center' }}>No bills found</td>
                                </tr>
                            ) : (
                                reportData.bills?.map((bill) => (
                                    <tr key={bill.id}>
                                        <td>{bill.bill_number}</td>
                                        <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                                        <td>
                                            {new Date(bill.period_start).toLocaleDateString()} - {new Date(bill.period_end).toLocaleDateString()}
                                        </td>
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

                    <h3 style={{ marginTop: '30px' }}>Payments</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Payment #</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Bill #</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.payments?.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center' }}>No payments found</td>
                                </tr>
                            ) : (
                                reportData.payments?.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.payment_number}</td>
                                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                        <td>₹{parseFloat(payment.amount).toFixed(2)}</td>
                                        <td>{payment.payment_method}</td>
                                        <td>{payment.bill?.bill_number || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Reports;

