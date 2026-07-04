import { Router } from 'express';
import {
    getProfile,
    listUsers,
    createUser,
    createWorkspace,
    updateDefaultWorkspace,
    getInviteDetails,
    acceptInvite,
    removeMember,
    deleteWorkspace,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/admin-middleware';
import { zodValidator } from '../middleware/zod-validator';
import { createWorkspaceSchema } from '../utils/validations';

const router = Router();

router.get('/invite', getInviteDetails);
router.post('/invite/accept', acceptInvite);
router.get('/profile', authenticateToken, getProfile);
router.get('/', authenticateToken, listUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.delete('/members/:userId', authenticateToken, requireAdmin, removeMember);
router.post('/workspace', authenticateToken, zodValidator({ body: createWorkspaceSchema }), createWorkspace);
router.put('/workspace/:workspaceId', authenticateToken, updateDefaultWorkspace);
router.delete('/workspace/:workspaceId', authenticateToken, requireAdmin, deleteWorkspace);

export default router;
