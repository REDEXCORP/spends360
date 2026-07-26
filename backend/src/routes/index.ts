import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import billingRoutes from './billing';
import requestRoutes from './request';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/billing', billingRoutes);
router.use('/requests', requestRoutes);

export default router;
