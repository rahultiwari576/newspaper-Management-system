import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/customers', label: 'Customers', icon: '👥' },
        { path: '/papers', label: 'Papers', icon: '📰' },
        { path: '/areas', label: 'Areas', icon: '📍' },
        { path: '/delivery-boys', label: 'Delivery Boys', icon: '🚴' },
        { path: '/bills', label: 'Bills', icon: '💰' },
        { path: '/payments', label: 'Payments', icon: '💳' },
        { path: '/reports', label: 'Reports', icon: '📈' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <aside
                style={{
                    width: sidebarOpen ? '250px' : '60px',
                    background: '#2c3e50',
                    color: 'white',
                    transition: 'width 0.3s',
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '20px', borderBottom: '1px solid #34495e' }}>
                    <h2 style={{ margin: 0, fontSize: sidebarOpen ? '20px' : '0', transition: 'font-size 0.3s' }}>
                        {sidebarOpen ? '📰 Newspaper MS' : '📰'}
                    </h2>
                </div>
                <nav>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'block',
                                padding: '15px 20px',
                                color: location.pathname === item.path ? '#3498db' : 'white',
                                textDecoration: 'none',
                                backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
                                borderLeft: location.pathname === item.path ? '4px solid #3498db' : '4px solid transparent',
                            }}
                        >
                            <span style={{ marginRight: sidebarOpen ? '10px' : '0' }}>{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main style={{ flex: 1, background: '#f5f5f5' }}>
                <header
                    style={{
                        background: 'white',
                        padding: '15px 30px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: '24px' }}>
                        {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
                    </h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </header>
                <div style={{ padding: '30px' }}>{children}</div>
            </main>
        </div>
    );
};

export default Layout;

