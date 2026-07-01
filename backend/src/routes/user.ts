import { Router } from 'express';
import { getProfile, updateDefaultWorkspace, createWorkspace } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth-middleware';
import { zodValidator } from '../middleware/zod-validator';
import { createWorkspaceSchema } from '../utils/validations';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/workspace/:workspaceId', authenticateToken, updateDefaultWorkspace);
router.post('/workspace', authenticateToken, zodValidator({ body: createWorkspaceSchema }), createWorkspace);

export default router;
