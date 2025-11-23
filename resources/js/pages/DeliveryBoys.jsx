import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import DeliveryBoyModal from '../components/DeliveryBoyModal';

const DeliveryBoys = () => {
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDeliveryBoy, setEditingDeliveryBoy] = useState(null);

    useEffect(() => {
        fetchDeliveryBoys();
    }, []);

    const fetchDeliveryBoys = async () => {
        try {
            const response = await api.get('/delivery-boys');
            setDeliveryBoys(response.data);
        } catch (error) {
            console.error('Error fetching delivery boys:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingDeliveryBoy(null);
        setModalOpen(true);
    };

    const handleEdit = (deliveryBoy) => {
        setEditingDeliveryBoy(deliveryBoy);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this delivery boy?')) {
            try {
                await api.delete(`/delivery-boys/${id}`);
                fetchDeliveryBoys();
            } catch (error) {
                console.error('Error deleting delivery boy:', error);
                alert('Error deleting delivery boy');
            }
        }
    };

    const handleSave = async (deliveryBoyData) => {
        try {
            if (editingDeliveryBoy) {
                await api.put(`/delivery-boys/${editingDeliveryBoy.id}`, deliveryBoyData);
            } else {
                await api.post('/delivery-boys', deliveryBoyData);
            }
            setModalOpen(false);
            fetchDeliveryBoys();
        } catch (error) {
            console.error('Error saving delivery boy:', error);
            alert('Error saving delivery boy');
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Delivery Boys</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Delivery Boy
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
                            <th>Areas</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryBoys.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No delivery boys found</td>
                            </tr>
                        ) : (
                            deliveryBoys.map((db) => (
                                <tr key={db.id}>
                                    <td>{db.name}</td>
                                    <td>{db.phone}</td>
                                    <td>{db.email || '-'}</td>
                                    <td>{db.address || '-'}</td>
                                    <td>{db.areas?.map(a => a.name).join(', ') || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${db.is_active ? 'success' : 'danger'}`}>
                                            {db.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(db)} style={{ marginRight: '5px' }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(db.id)}>
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
                <DeliveryBoyModal
                    deliveryBoy={editingDeliveryBoy}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default DeliveryBoys;

