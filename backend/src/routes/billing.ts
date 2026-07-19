import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/admin-middleware';
import { createPortalSession, getBilling, updateSeats } from '../controllers/billingController';

const router = Router();

router.get('/', authenticateToken, getBilling);
router.patch('/seats', authenticateToken, requireAdmin, updateSeats);
router.post('/portal', authenticateToken, requireAdmin, createPortalSession);

export default router;
