import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import billingRoutes from './billing';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/billing', billingRoutes);

export default router;
