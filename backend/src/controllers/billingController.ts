import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { authenticatedUser } from '../utils';
import { AppError } from '../utils/AppError';
import * as billingService from '../services/billingService';

export const getBilling = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = authenticatedUser(req);
    const billing = await billingService.getBilling(workspaceId);
    return res.json(billing);
});

export const updateSeats = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = authenticatedUser(req);
    const users = Number(req.body?.users);

    if (!Number.isFinite(users)) {
        throw new AppError('users is required', 400);
    }

    const result = await billingService.updateSeats(workspaceId, users);
    return res.json(result);
});

export const createPortalSession = asyncHandler(async (req: Request, res: Response) => {
    const { workspaceId } = authenticatedUser(req);
    const session = await billingService.createPortalSession(workspaceId);
    return res.json(session);
});
