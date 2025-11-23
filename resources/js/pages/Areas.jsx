import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AreaModal from '../components/AreaModal';

const Areas = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const response = await api.get('/areas');
            setAreas(response.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingArea(null);
        setModalOpen(true);
    };

    const handleEdit = (area) => {
        setEditingArea(area);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this area?')) {
            try {
                await api.delete(`/areas/${id}`);
                fetchAreas();
            } catch (error) {
                console.error('Error deleting area:', error);
                alert('Error deleting area');
            }
        }
    };

    const handleSave = async (areaData) => {
        try {
            if (editingArea) {
                await api.put(`/areas/${editingArea.id}`, areaData);
            } else {
                await api.post('/areas', areaData);
            }
            setModalOpen(false);
            fetchAreas();
        } catch (error) {
            console.error('Error saving area:', error);
            alert('Error saving area');
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Areas</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Area
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Delivery Boys</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {areas.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No areas found</td>
                            </tr>
                        ) : (
                            areas.map((area) => (
                                <tr key={area.id}>
                                    <td>{area.name}</td>
                                    <td>{area.code}</td>
                                    <td>{area.description || '-'}</td>
                                    <td>{area.delivery_boys?.map(db => db.name).join(', ') || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${area.is_active ? 'success' : 'danger'}`}>
                                            {area.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(area)} style={{ marginRight: '5px' }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(area.id)}>
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
                <AreaModal
                    area={editingArea}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Areas;

