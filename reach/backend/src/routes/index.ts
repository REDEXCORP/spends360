import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import callsRoutes from './calls';
import settingsRoutes from './settings';
import productsRoutes from './products';
import pilotsRoutes from './pilots';
import batchesRoutes from './batches';
import leadsRoutes from './leads';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/calls', callsRoutes);
router.use('/settings', settingsRoutes);
router.use('/products', productsRoutes);
router.use('/pilots', pilotsRoutes);
router.use('/batches', batchesRoutes);
router.use('/leads', leadsRoutes);

export default router;
