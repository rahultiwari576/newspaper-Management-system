import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
            </Routes>
        </Layout>
    );
}

export default App;

