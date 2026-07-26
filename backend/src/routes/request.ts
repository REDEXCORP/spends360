import { Router } from 'express';
import {
    listMyRequests,
    listMyTasks,
    listMyApprovals,
    getRequestDetail,
    addComment,
    createRequest,
    cancelRequest,
    decideApproval,
} from '../controllers/requestController';
import { authenticateToken } from '../middleware/auth-middleware';
import { zodValidator } from '../middleware/zod-validator';
import {
    approvalDecisionSchema,
    createRequestCommentSchema,
    createRequestSchema,
} from '../utils/validations';

const router = Router();

router.get('/mine', authenticateToken, listMyRequests);
router.get('/assigned/mine', authenticateToken, listMyTasks);
router.get('/approvals/mine', authenticateToken, listMyApprovals);
router.post('/', authenticateToken, zodValidator({ body: createRequestSchema }), createRequest);
router.patch(
    '/approvals/:approvalId',
    authenticateToken,
    zodValidator({ body: approvalDecisionSchema }),
    decideApproval
);
router.get('/:requestId', authenticateToken, getRequestDetail);
router.post(
    '/:requestId/comments',
    authenticateToken,
    zodValidator({ body: createRequestCommentSchema }),
    addComment
);
router.patch('/:requestId/cancel', authenticateToken, cancelRequest);

export default router;
