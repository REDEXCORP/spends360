import { Response } from 'express';
import * as usersRepository from '../repositories/usersRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import { removePassword } from '../utils';
import { generateTokensAndSetCookies } from './authService';
import * as workspaceRepository from '../repositories/workspaceRepository';

export const getProfile = async (userId: number) => {
    const profileData = await usersRepository.getUserProfileWithWorkspaces(userId);
    return {
        ...removePassword(profileData[0].user),
        workspaces: profileData[0].workspaces ? profileData.map(data => ({
            id: data.workspaces?.id,
            name: data.workspaces?.name,
            role: data.workspaceMembers?.role,
            isDefault: data.workspaceMembers?.isDefault,
            inviteAccepted: data.workspaceMembers?.inviteAccepted,
            plan: data.workspaces?.plan,
        })) : [],
    };
};

export const updateDefaultWorkspace = async (userId: number, workspaceId: number, res: Response) => {
    const membership = await workspaceMembersRepository.getWorkspaceMember(userId, workspaceId);
    if (!membership) {
        throw new Error('User does not belong to this workspace');
    }
    const user = await usersRepository.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    await generateTokensAndSetCookies(user, res);
    return await workspaceMembersRepository.setDefaultWorkspace(userId, workspaceId);
};

export const createWorkspace = async (userId: number, name: string) => {
    const workspace = await workspaceRepository.createWorkspace(name, userId);
    await workspaceMembersRepository.createWorkspaceMembers({
        userId,
        workspaceId: workspace.id,
        role: 'ADMIN',
        inviteAccepted: true,
        createdBy: userId,
    });
    return workspace;
};
