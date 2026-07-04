import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as pilotService from '../services/pilotService';

export const listPilots = asyncHandler(async (req: Request, res: Response) => {
    const pilots = await pilotService.listPilots(req.user.workspaceId);
    return res.json(pilots);
});

export const createPilot = asyncHandler(async (req: Request, res: Response) => {
    const pilot = await pilotService.createPilot(
        req.user.workspaceId,
        req.user.userId,
        req.body
    );

    return res.status(201).json(pilot);
});
