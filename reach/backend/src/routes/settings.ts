import { Router } from 'express';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/admin-middleware';
import { getTelnyxConfig, saveTelnyxConfig } from '../controllers/telnyxConfigController';

const router = Router();

router.get('/telnyx', authenticateToken, requireAdmin, getTelnyxConfig);
router.put('/telnyx', authenticateToken, requireAdmin, saveTelnyxConfig);

export default router;
