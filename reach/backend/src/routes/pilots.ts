import { Router } from 'express';
import { createPilot, listPilots } from '../controllers/pilotController';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/', authenticateToken, listPilots);
router.post('/', authenticateToken, createPilot);

export default router;
