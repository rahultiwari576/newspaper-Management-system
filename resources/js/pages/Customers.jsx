import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import CustomerModal from '../components/CustomerModal';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
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
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCustomer(null);
        setModalOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await api.delete(`/customers/${id}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting customer:', error);
                alert('Error deleting customer');
            }
        }
    };

    const handleSave = async (customerData) => {
        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, customerData);
            } else {
                await api.post('/customers', customerData);
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Error saving customer');
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Customers</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Customer
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Area</th>
                            <th>Delivery Boy</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>No customers found</td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.name}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email || '-'}</td>
                                    <td>{customer.address}</td>
                                    <td>{customer.area?.name}</td>
                                    <td>{customer.delivery_boy?.name || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${customer.is_active ? 'success' : 'danger'}`}>
                                            {customer.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(customer)} style={{ marginRight: '5px' }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(customer.id)}>
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
                <CustomerModal
                    customer={editingCustomer}
                    areas={areas}
                    deliveryBoys={deliveryBoys}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Customers;

