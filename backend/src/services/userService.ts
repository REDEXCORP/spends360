import crypto from 'crypto';
import { Response } from 'express';
import * as usersRepository from '../repositories/usersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import { removePassword } from '../utils';
import { sendEmail } from './emailService';
import { AppError } from '../utils/AppError';
import { generateTokensAndSetCookies } from './authService';
import { AuthService } from '../infrastructure/auth';
import { buildWorkspaceInviteEmail } from '../templates/workspaceInviteTemplate';
import { acceptWorkspaceInvite, resolveInvite } from './inviteService';

export const getProfile = async (userId: number) => {
    const profileRows = await usersRepository.getUserProfileWithWorkspaces(userId);
    if (!profileRows.length) {
        throw new AppError('User not found', 404);
    }

    const profile = removePassword(profileRows[0].user);
    const defaultWorkspaceId = profileRows[0].user.defaultWorkspaceId;

    const workspaces = profileRows
        .filter(row => row.workspaces && row.workspaceMembers?.inviteAccepted)
        .map(row => ({
            id: row.workspaces!.id,
            name: row.workspaces!.name,
            role: row.workspaceMembers!.role,
            isDefault: row.workspaces!.id === defaultWorkspaceId,
            inviteAccepted: row.workspaceMembers!.inviteAccepted,
            subscriptionStatus: row.workspaces!.subscriptionStatus,
            subscriptionInterval: row.workspaces!.subscriptionInterval,
            userCount: row.workspaces!.userCount,
        }));

    const activeWorkspace =
        workspaces.find(workspace => workspace.isDefault) ?? workspaces[0];

    return {
        ...profile,
        role: activeWorkspace?.role ?? null,
        workspaceId: activeWorkspace?.id ?? null,
        subscriptionStatus: activeWorkspace?.subscriptionStatus ?? 'inactive',
        workspaces,
    };
};

export const createWorkspace = async (userId: number, name: string) => {
    const workspace = await workspaceRepository.create(name.trim(), userId);
    await workspaceMembersRepository.create({
        userId,
        workspaceId: workspace.id,
        role: 'ADMIN',
        inviteAccepted: true,
        createdBy: userId,
        updatedBy: userId,
    });
    await workspaceMembersRepository.ensureDefaultWorkspace(userId);
    return workspace;
};

export const updateDefaultWorkspace = async (
    userId: number,
    workspaceId: number,
    res: Response
) => {
    const membership = await workspaceMembersRepository.getWorkspaceMember(userId, workspaceId);
    if (!membership) {
        throw new AppError('User does not belong to this workspace', 403);
    }

    if (!membership.inviteAccepted) {
        throw new AppError('Please accept the workspace invitation first.', 403);
    }

    const user = await usersRepository.getUserById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await workspaceMembersRepository.setDefaultWorkspace(userId, workspaceId);
    await generateTokensAndSetCookies(user, res);

    return membership;
};

export const listUsers = async (workspaceId: number | null) => {
    if (!workspaceId) return [];
    const users = await usersRepository.listUsersByWorkspaceId(workspaceId);
    return users.map(removePassword);
};

const sendWorkspaceInviteEmail = async (
    email: string,
    workspaceName: string,
    role: 'ADMIN' | 'USER',
    workspaceId: number
) => {
    const token = AuthService.generateInviteToken({ email, workspaceId, role });
    const inviteLink = `${process.env.FRONTEND_URL}/invite/accept?token=${encodeURIComponent(token)}`;

    const { html, text } = buildWorkspaceInviteEmail(workspaceName, role, inviteLink);

    await sendEmail({
        to: email,
        subject: `Reach: ${workspaceName} workspace invitation`,
        html,
        text,
    });
};

export const createUser = async (
    email: string,
    role: 'ADMIN' | 'USER',
    workspaceId: number | null,
    creatorId: number
) => {
    if (!workspaceId) {
        throw new AppError('Your account must belong to a workspace to add users.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
        throw new AppError('Workspace not found', 404);
    }

    const members = await usersRepository.listUsersByWorkspaceId(workspaceId);
    if (members.length >= workspace.userCount) {
        throw new AppError(
            `Seat limit reached (${workspace.userCount}). Increase seats in Billing first.`,
            400
        );
    }

    let invitedUser = await usersRepository.getUserByEmail(normalizedEmail);

    if (invitedUser) {
        const membership = await workspaceMembersRepository.getWorkspaceMember(invitedUser.id, workspaceId);
        if (membership) {
            throw new AppError('User is already a member of this workspace', 400);
        }
    } else {
        const passwordHash = await AuthService.hashPassword(crypto.randomUUID());

        invitedUser = await usersRepository.create({
            email: normalizedEmail,
            password: passwordHash,
            isVerified: false,
        });
    }

    await workspaceMembersRepository.create({
        userId: invitedUser.id,
        workspaceId,
        role,
        inviteAccepted: false,
        createdBy: creatorId,
        updatedBy: creatorId,
    });

    try {
        await sendWorkspaceInviteEmail(normalizedEmail, workspace.name, role, workspaceId);
    } catch (emailError: any) {
        console.error('Failed to send workspace invite email:', emailError);
        throw new AppError('Failed to send invitation email. Please try again later.', 500);
    }

    return removePassword(invitedUser);
};

export const getInviteDetails = async (token: string) => {
    const { payload, workspace, user, membership } = await resolveInvite(token);

    return {
        email: payload.email,
        workspaceId: payload.workspaceId,
        workspaceName: workspace.name,
        role: payload.role,
        inviteAccepted: membership.inviteAccepted,
        isVerified: user.isVerified,
        hasAccount: user.isVerified,
    };
};

export const acceptInvite = async (token: string) => {
    const { payload, workspace, user, membership } = await resolveInvite(token);

    if (!user.isVerified) {
        throw new AppError('Please create an account before accepting this invitation.', 400);
    }

    if (membership.inviteAccepted) {
        return {
            message: 'Invitation already accepted. You can sign in to access the workspace.',
            workspaceId: payload.workspaceId,
            workspaceName: workspace.name,
        };
    }

    await acceptWorkspaceInvite(user.id, payload.workspaceId, user.id);

    return {
        message: 'Invitation accepted. You can now sign in and access the workspace.',
        workspaceId: payload.workspaceId,
        workspaceName: workspace.name,
    };
};

export const removeMember = async (
    workspaceId: number | null,
    targetUserId: number,
    actorUserId: number
) => {
    if (!workspaceId) {
        throw new AppError('Your account must belong to a workspace to manage members.', 400);
    }

    if (targetUserId === actorUserId) {
        throw new AppError('You cannot remove yourself from this workspace.', 400);
    }

    const membership = await workspaceMembersRepository.getWorkspaceMember(targetUserId, workspaceId);
    if (!membership) {
        throw new AppError('Member not found in this workspace', 404);
    }

    if (membership.role === 'ADMIN') {
        const adminCount = await workspaceMembersRepository.countAdminsInWorkspace(workspaceId);
        if (adminCount <= 1) {
            throw new AppError('Cannot remove the last admin from this workspace.', 400);
        }
    }

    await workspaceMembersRepository.remove(targetUserId, workspaceId);

    return { message: 'Member removed from this workspace.' };
};

export const deleteWorkspace = async (
    userId: number,
    workspaceId: number,
    res: Response
) => {
    const membership = await workspaceMembersRepository.getWorkspaceMember(userId, workspaceId);
    if (!membership || membership.role !== 'ADMIN') {
        throw new AppError('Only workspace admins can delete this workspace.', 403);
    }

    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
        throw new AppError('Workspace not found', 404);
    }

    // CASCADE deletes memberships; DB triggers repoint defaults / drop empty workspaces
    await workspaceRepository.remove(workspaceId);

    const user = await usersRepository.getUserById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    await generateTokensAndSetCookies(user, res);

    return { message: 'Workspace deleted successfully.' };
};
