import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import jobsRoutes from './jobs';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/jobs', jobsRoutes);

export default router;
