import { Router } from 'express';
import { createLead, listLeads } from '../controllers/leadController';
import { authenticateToken } from '../middleware/auth-middleware';

const router = Router();

router.get('/', authenticateToken, listLeads);
router.post('/', authenticateToken, createLead);

export default router;
