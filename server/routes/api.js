import express from 'express';
import paperRoutes from './papers.js';
import areaRoutes from './areas.js';
import deliveryBoyRoutes from './deliveryBoys.js';
import customerRoutes from './customers.js';
import subscriptionRoutes from './subscriptions.js';
import billRoutes from './bills.js';
import paymentRoutes from './payments.js';
import dashboardRoutes from './dashboard.js';
import reportRoutes from './reports.js';

const router = express.Router();

router.use('/papers', paperRoutes);
router.use('/areas', areaRoutes);
router.use('/delivery-boys', deliveryBoyRoutes);
router.use('/customers', customerRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/bills', billRoutes);
router.use('/payments', paymentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;

