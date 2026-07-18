import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as userService from '../services/userService';
import { AppError } from '../utils/AppError';
import { authenticatedUser } from '../utils';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profileData = await userService.getProfile(req.user.userId);
    return res.json(profileData);
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.listUsers(req.user.workspaceId);
    return res.json(users);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, role } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const newUser = await userService.createUser(
        email,
        role || 'USER',
        req.user.workspaceId,
        req.user.userId
    );

    return res.status(201).json(newUser);
});

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name?.trim()) {
        throw new AppError('Workspace name is required', 400);
    }

    const workspace = await userService.createWorkspace(req.user.userId, name);
    return res.status(201).json(workspace);
});

export const getInviteDetails = asyncHandler(async (req: Request, res: Response) => {
    const details = await userService.getInviteDetails(req.query.token as string );
    return res.json(details);
});

export const acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const token = req.body?.token || req.query?.token;
    if (!token || typeof token !== 'string') {
        throw new AppError('Invitation token is required', 400);
    }

    const result = await userService.acceptInvite(token);
    return res.json(result);
});

export const updateDefaultWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = authenticatedUser(req);
    const { workspaceId } = req.params;
    const updatedWorkspace = await userService.updateDefaultWorkspace(
        userId,
        Number(workspaceId),
        res
    );
    return res.json(updatedWorkspace);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = authenticatedUser(req);
    const targetUserId = Number(req.params.userId);

    if (!Number.isFinite(targetUserId)) {
        throw new AppError('Invalid member id', 400);
    }

    const result = await userService.removeMember(req.user.workspaceId, targetUserId, userId);
    return res.json(result);
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = authenticatedUser(req);
    const workspaceId = Number(req.params.workspaceId);

    if (!Number.isFinite(workspaceId)) {
        throw new AppError('Invalid workspace id', 400);
    }

    const result = await userService.deleteWorkspace(userId, workspaceId, res);
    return res.json(result);
});

export const activateSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { userId, workspaceId } = authenticatedUser(req);
    if (!workspaceId) {
        throw new AppError('No active workspace', 400);
    }

    const { billing, users, paddleSubscriptionId } = req.body ?? {};
    if (billing !== 'monthly' && billing !== 'yearly') {
        throw new AppError('billing must be monthly or yearly', 400);
    }

    const result = await userService.activateSubscription(userId, workspaceId, {
        billing,
        users: Number(users),
        paddleSubscriptionId,
    });
    return res.json(result);
});
