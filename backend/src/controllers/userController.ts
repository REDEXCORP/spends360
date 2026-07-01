import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import * as userService from '../services/userService';
import { createWorkspaceSchema } from '../utils/validations';
import { authenticatedUser } from '../utils';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const profileData = await userService.getProfile(req.user.userId);
    return res.json(profileData);
});

export const updateDefaultWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = authenticatedUser(req);
    const { workspaceId } = req.params;
    const updatedWorkspace = await userService.updateDefaultWorkspace(userId, Number(workspaceId), res);
    return res.json(updatedWorkspace);
});

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const { name } = createWorkspaceSchema.parse(req.body);
    const workspace = await userService.createWorkspace(req.user.userId, name);
    return res.status(201).json(workspace);
});
