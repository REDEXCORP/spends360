import { Request } from 'express';

export const getUsernameFromEmail = (email: string): string => email.split('@')[0];

export function removePassword(user: any) {
    delete user?.password;
    delete user?.refreshToken;
    return user;
}

export function authenticatedUser(req: Request): { userId: number; workspaceId: number; role: string } {
    const user = req.user;

    if (!user || !user.userId || !user.workspaceId || !user.role) throw new Error('Unauthorized');

    return {
        userId: user.userId,
        workspaceId: user.workspaceId,
        role: user.role,
    };
}
