import { Router } from 'express';
import { createJob, getJobs, getJob, updateJob } from '../controllers/jobsController';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.post('/', authenticateToken, createJob);
router.get('/', authenticateToken, getJobs);
router.get('/:jobId', authenticateToken, getJob);
router.put('/:jobId', authenticateToken, updateJob);

export default router;
