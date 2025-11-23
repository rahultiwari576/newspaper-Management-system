import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Papers from './pages/Papers';
import Areas from './pages/Areas';
import DeliveryBoys from './pages/DeliveryBoys';
import Bills from './pages/Bills';
import Payments from './pages/Payments';
import Reports from './pages/Reports';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/customers" element={<Customers />} />
                                    <Route path="/papers" element={<Papers />} />
                                    <Route path="/areas" element={<Areas />} />
                                    <Route path="/delivery-boys" element={<DeliveryBoys />} />
                                    <Route path="/bills" element={<Bills />} />
                                    <Route path="/payments" element={<Payments />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
}

export default App;

