import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as leadService from '../services/leadService';

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
    const leads = await leadService.listLeads(req.user.workspaceId);
    return res.json(leads);
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.createLead(
        req.user.workspaceId,
        req.user.userId,
        req.body
    );

    return res.status(201).json(lead);
});
