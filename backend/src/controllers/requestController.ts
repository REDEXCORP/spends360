import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as requestService from '../services/requestService';
import { AppError } from '../utils/AppError';
import { authenticatedUser } from '../utils';

export const listMyRequests = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const result = await requestService.listMyRequests(workspaceId, userId);
    return res.json(result);
});

export const listMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const result = await requestService.listMyTasks(workspaceId, userId);
    return res.json(result);
});

export const listMyApprovals = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const result = await requestService.listMyApprovals(workspaceId, userId);
    return res.json(result);
});

export const getRequestDetail = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const requestId = Number(req.params.requestId);

    if (!Number.isFinite(requestId)) {
        throw new AppError('Invalid request id', 400);
    }

    const result = await requestService.getRequestDetail(workspaceId, userId, requestId);
    return res.json(result);
});

export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const requestId = Number(req.params.requestId);

    if (!Number.isFinite(requestId)) {
        throw new AppError('Invalid request id', 400);
    }

    const result = await requestService.addComment(
        workspaceId,
        userId,
        requestId,
        req.body.body
    );
    return res.status(201).json(result);
});

export const createRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const created = await requestService.createRequest(workspaceId, userId, req.body);
    return res.status(201).json(created);
});

export const cancelRequest = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const requestId = Number(req.params.requestId);

    if (!Number.isFinite(requestId)) {
        throw new AppError('Invalid request id', 400);
    }

    const updated = await requestService.cancelRequest(workspaceId, userId, requestId);
    return res.json(updated);
});

export const decideApproval = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    const approvalId = Number(req.params.approvalId);

    if (!Number.isFinite(approvalId)) {
        throw new AppError('Invalid approval id', 400);
    }

    const result = await requestService.decideApproval(
        workspaceId,
        userId,
        approvalId,
        req.body.action,
        req.body.comment
    );
    return res.json(result);
});
