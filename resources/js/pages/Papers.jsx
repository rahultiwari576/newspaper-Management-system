import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import PaperModal from '../components/PaperModal';

const Papers = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPaper, setEditingPaper] = useState(null);

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const response = await api.get('/papers');
            setPapers(response.data);
        } catch (error) {
            console.error('Error fetching papers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingPaper(null);
        setModalOpen(true);
    };

    const handleEdit = (paper) => {
        setEditingPaper(paper);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this paper?')) {
            try {
                await api.delete(`/papers/${id}`);
                fetchPapers();
            } catch (error) {
                console.error('Error deleting paper:', error);
                alert('Error deleting paper');
            }
        }
    };

    const handleSave = async (paperData) => {
        try {
            if (editingPaper) {
                await api.put(`/papers/${editingPaper.id}`, paperData);
            } else {
                await api.post('/papers', paperData);
            }
            setModalOpen(false);
            fetchPapers();
        } catch (error) {
            console.error('Error saving paper:', error);
            alert('Error saving paper');
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Papers</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    Add Paper
                </button>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {papers.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No papers found</td>
                            </tr>
                        ) : (
                            papers.map((paper) => (
                                <tr key={paper.id}>
                                    <td>{paper.name}</td>
                                    <td>₹{parseFloat(paper.price).toFixed(2)}</td>
                                    <td>
                                        <span className={`badge badge-${paper.type === 'daily' ? 'info' : 'warning'}`}>
                                            {paper.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${paper.is_active ? 'success' : 'danger'}`}>
                                            {paper.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => handleEdit(paper)} style={{ marginRight: '5px' }}>
                                            Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleDelete(paper.id)}>
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
                <PaperModal
                    paper={editingPaper}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Papers;

