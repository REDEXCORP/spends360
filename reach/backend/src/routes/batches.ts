import { Router } from 'express';
import { createBatch, listBatches } from '../controllers/batchController';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/', authenticateToken, listBatches);
router.post('/', authenticateToken, createBatch);

export default router;
