import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as telnyxConfigService from '../services/telnyxConfigService';
import { AppError } from '../utils/AppError';

export const getTelnyxConfig = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const config = await telnyxConfigService.getPublicView(req.user.workspaceId);
    return res.json(config);
});

export const saveTelnyxConfig = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user.workspaceId) {
        throw new AppError('Workspace is required', 400);
    }

    const config = await telnyxConfigService.saveConfig(
        req.user.workspaceId,
        req.body,
        req.user.userId
    );

    return res.json(config);
});
