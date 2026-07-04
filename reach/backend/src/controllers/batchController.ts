import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as batchService from '../services/batchService';

export const listBatches = asyncHandler(async (req: Request, res: Response) => {
    const batches = await batchService.listBatches(req.user.workspaceId);
    return res.json(batches);
});

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
    const batch = await batchService.createBatch(
        req.user.workspaceId,
        req.user.userId,
        req.body
    );

    return res.status(201).json(batch);
});
