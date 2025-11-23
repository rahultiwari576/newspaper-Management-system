import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase, saveDatabase } from './database/dbAdapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const dbPath = join(__dirname, '..', 'database', 'newspaper.db');
initDatabase(dbPath).then(async (db) => {
    // Initialize schema
    const { initDatabase: initSchema } = await import('./database/init.js');
    initSchema(db);
    
    // Auto-save database periodically
    setInterval(() => {
        saveDatabase();
    }, 30000); // Save every 30 seconds
    
    // Save on process exit
    process.on('SIGINT', () => {
        saveDatabase();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        saveDatabase();
        process.exit(0);
    });

    // Routes
    const { default: papersRouter } = await import('./routes/papers.js');
    app.use('/api/papers', papersRouter(db));
    
    const { default: areasRouter } = await import('./routes/areas.js');
    app.use('/api/areas', areasRouter(db));
    
    const { default: deliveryBoysRouter } = await import('./routes/deliveryBoys.js');
    app.use('/api/delivery-boys', deliveryBoysRouter(db));
    
    const { default: customersRouter } = await import('./routes/customers.js');
    app.use('/api/customers', customersRouter(db));
    
    const { default: subscriptionsRouter } = await import('./routes/subscriptions.js');
    app.use('/api/subscriptions', subscriptionsRouter(db));
    
    const { default: billsRouter } = await import('./routes/bills.js');
    app.use('/api/bills', billsRouter(db));
    
    const { default: paymentsRouter } = await import('./routes/payments.js');
    app.use('/api/payments', paymentsRouter(db));
    
    const { default: dashboardRouter } = await import('./routes/dashboard.js');
    app.use('/api/dashboard', dashboardRouter(db));
    
    const { default: reportsRouter } = await import('./routes/reports.js');
    app.use('/api/reports', reportsRouter(db));
    
    const { default: authRouter } = await import('./routes/auth.js');
    app.use('/api/auth', authRouter(db));
    
    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok' });
    });

app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
    });
});

export default app;
