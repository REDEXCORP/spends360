import * as usersRepository from '../repositories/usersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import { AppError } from '../utils/AppError';
import { AuthService } from '../infrastructure/auth';
import { CookieConfig } from '../infrastructure/cookie';
import { Request, Response } from 'express';
import { getUsernameFromEmail, removePassword } from '../utils';
import { Role } from '../utils/enums';

export const register = async (email: string, password: string) => {
    const existingUser = await usersRepository.getUserByEmail(email);
    if (existingUser) throw new AppError('Email already in use', 400);

    const hashedPassword = await AuthService.hashPassword(password);
    const user = await usersRepository.create({
        username: getUsernameFromEmail(email),
        email,
        password: hashedPassword,
        isVerified: false,
    });

    const workspace = await workspaceRepository.createWorkspace(`${user.username}'s Workspace`, user.id);
    await workspaceMembersRepository.createWorkspaceMembers({
        userId: user.id,
        workspaceId: workspace.id,
        role: Role.ADMIN,
        isDefault: true,
        inviteAccepted: false,
        createdBy: user.id,
        updatedBy: user.id,
    });

    return removePassword(user);
};

export const verifyUser = async (id: number) => {
    const user = await usersRepository.getUserById(id);
    if (!user) throw new AppError('User not found', 404);

    const updatedUser = await usersRepository.update(id, { isVerified: true });
    if (!updatedUser) throw new AppError('Error updating user', 500);

    const userWithoutPassword = { ...updatedUser } as any;
    delete userWithoutPassword.password;
    return userWithoutPassword;
};

export const generateTokensAndSetCookies = async (user: any, res: Response) => {
    const userWorkspace = await workspaceMembersRepository.getUserDefaultWorkspace(user.id);
    const accessToken = AuthService.generateAccessToken(user.id, userWorkspace?.role, userWorkspace?.workspaceId);
    const refreshToken = AuthService.generateRefreshToken(user.id);

    await usersRepository.updateRefreshToken(user.id, refreshToken);

    CookieConfig.setCookie(res, CookieConfig.ACCESS_TOKEN_COOKIE_NAME, accessToken, 15 * 60 * 1000);
    CookieConfig.setCookie(res, CookieConfig.REFRESH_TOKEN_COOKIE_NAME, refreshToken, 7 * 24 * 60 * 60 * 1000);

    return { accessToken, refreshToken };
};

export const login = async (email: string, password: string, res: Response) => {
    const user = await usersRepository.getUserByEmail(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    if (!user.isVerified) throw new AppError('User is not verified', 403);

    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    await generateTokensAndSetCookies(user, res);

    return removePassword(user);
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = CookieConfig.getCookieValue(req, CookieConfig.REFRESH_TOKEN_COOKIE_NAME);
    if (!token) throw new AppError('No refresh token provided', 401);

    let claims;
    try {
        claims = AuthService.validateAndExtractClaims(token);
    } catch {
        throw new AppError('Invalid refresh token', 401);
    }

    const userId = Number(claims.sub);
    const user = await usersRepository.getUserById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (token !== user.refreshToken) {
        throw new AppError('Invalid refresh token', 401);
    }

    await generateTokensAndSetCookies(user, res);

    return removePassword(user);
};
