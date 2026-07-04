import { Request } from 'express';

export const getUsernameFromEmail = (email: string): string => email.split('@')[0];

export const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return forwarded[0].split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.ip || 'unknown';
};

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
