import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth-middleware';
import { createPortalSession, getBilling, updateSeats } from '../controllers/billingController';

const router = Router();

router.get('/', authenticateToken, getBilling);
router.patch('/seats', authenticateToken, requireAdmin, updateSeats);
router.post('/portal', authenticateToken, requireAdmin, createPortalSession);

export default router;
