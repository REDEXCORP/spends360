import { AuthService } from '../infrastructure/auth';
import { InviteTokenPayload } from '../utils/interfaces';
import * as usersRepository from '../repositories/usersRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import { AppError } from '../utils/AppError';

export const parseInviteToken = (token: string): InviteTokenPayload => {
    try {
        return AuthService.verifyInviteToken(token);
    } catch {
        throw new AppError('Invalid or expired invitation link', 401);
    }
};

type ResolvedInvite = {
    payload: InviteTokenPayload;
    workspace: NonNullable<Awaited<ReturnType<typeof workspaceRepository.getById>>>;
    user: NonNullable<Awaited<ReturnType<typeof usersRepository.getUserByEmail>>>;
    membership: NonNullable<Awaited<ReturnType<typeof workspaceMembersRepository.getWorkspaceMember>>>;
};

export const resolveInvite = async (token: string): Promise<ResolvedInvite> => {
    const payload = parseInviteToken(token);

    const workspace = await workspaceRepository.getById(payload.workspaceId);
    if (!workspace) {
        throw new AppError('Workspace not found', 404);
    }

    const user = await usersRepository.getUserByEmail(payload.email);
    if (!user) {
        throw new AppError('Invitation not found. Please contact your workspace admin.', 404);
    }

    const membership = await workspaceMembersRepository.getWorkspaceMember(user.id, payload.workspaceId);
    if (!membership) {
        throw new AppError('Invitation not found. Please contact your workspace admin.', 404);
    }

    return { payload, workspace, user, membership };
};

export const acceptWorkspaceInvite = async (
    userId: number,
    workspaceId: number,
    updatedBy: number
) => {
    const membership = await workspaceMembersRepository.getWorkspaceMember(userId, workspaceId);
    if (!membership || membership.inviteAccepted) {
        return false;
    }

    const hasAcceptedWorkspace = await workspaceMembersRepository.getUserFirstAcceptedWorkspace(userId);

    await workspaceMembersRepository.update(membership.id, {
        inviteAccepted: true,
        updatedBy,
    });

    if (!hasAcceptedWorkspace) {
        await workspaceMembersRepository.setDefaultWorkspace(userId, workspaceId);
    }

    return true;
};
