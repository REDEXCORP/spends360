import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { getCalls as getCallsService } from '../services/calls';

export const getCalls = asyncHandler(async (_req: Request, res: Response) => {
    return res.json(await getCallsService());
});
