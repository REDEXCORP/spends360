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
    activateSubscription,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth-middleware';
import { requireAdmin } from '../middleware/admin-middleware';
import { zodValidator } from '../middleware/zod-validator';
import { createWorkspaceSchema } from '../utils/validations';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/invite', getInviteDetails);
router.post('/invite/accept', acceptInvite);
router.get('/', authenticateToken, listUsers);
router.post('/', authenticateToken, requireAdmin, createUser);
router.delete('/members/:userId', authenticateToken, requireAdmin, removeMember);
router.post('/workspace', authenticateToken, zodValidator({ body: createWorkspaceSchema }), createWorkspace);
router.put('/workspace/:workspaceId', authenticateToken, updateDefaultWorkspace);
router.delete('/workspace/:workspaceId', authenticateToken, requireAdmin, deleteWorkspace);
router.post('/subscription/activate', authenticateToken, requireAdmin, activateSubscription);

export default router;
