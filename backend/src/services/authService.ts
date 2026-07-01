import * as usersRepository from '../repositories/usersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import { AppError } from '../utils/AppError';
import { AuthService } from '../infrastructure/auth';
import { CookieConfig } from '../infrastructure/cookie';
import { MailService } from '../infrastructure/mail';
import { OTP_VERIFICATION } from '../templates/otpVerification';
import { OTP_TTL_MS } from '../constants/otp';
import { Request, Response } from 'express';
import { getUsernameFromEmail, removePassword } from '../utils';
import { generateOtp } from '../utils/otp';
import { Role } from '../utils/enums';

const sendOtpEmail = async (email: string, otp: string) => {
    const html = OTP_VERIFICATION.replace('{{otp}}', otp).replace('{{ttlMinutes}}', String(OTP_TTL_MS / (60 * 1000)));

    await MailService.sendMail({
        to: email,
        subject: 'Your Spends360 verification code',
        html,
    });
};

const createUserWithWorkspace = async (email: string, hashedPassword: string, otp: string, expiresAt: Date) => {
    const user = await usersRepository.create({
        username: getUsernameFromEmail(email),
        email,
        password: hashedPassword,
        isVerified: false,
        otp,
        otpExpiresAt: expiresAt,
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

    return user;
};

export const register = async (email: string, password: string) => {
    const existingUser = await usersRepository.getUserByEmail(email);
    const hashedPassword = await AuthService.hashPassword(password);
    const { otp, expiresAt } = generateOtp();

    if (existingUser) {
        if (existingUser.isVerified) {
            throw new AppError('Email already in use', 400);
        }

        await usersRepository.update(existingUser.id, {
            password: hashedPassword,
            otp,
            otpExpiresAt: expiresAt,
        });
    } else {
        await createUserWithWorkspace(email, hashedPassword, otp, expiresAt);
    }

    await sendOtpEmail(email, otp);

    return {
        message: 'Verification code sent to your email',
        email,
    };
};

export const verifyOtp = async (email: string, otp: string, res: Response) => {
    const user = await usersRepository.getUserByEmail(email);
    if (!user) throw new AppError('Invalid verification code', 400);

    if (user.isVerified) {
        throw new AppError('Account already verified. Please log in.', 400);
    }

    if (!user.otp || !user.otpExpiresAt) {
        throw new AppError('No verification code found. Please register again.', 400);
    }

    if (user.otp !== otp) {
        throw new AppError('Invalid verification code', 400);
    }

    if (new Date() > user.otpExpiresAt) {
        throw new AppError('Verification code expired. Please register again to get a new code.', 400);
    }

    const updatedUser = await usersRepository.update(user.id, {
        isVerified: true,
        otp: null,
        otpExpiresAt: null,
    });

    if (!updatedUser) throw new AppError('Error verifying account', 500);

    await generateTokensAndSetCookies(updatedUser, res);

    return removePassword(updatedUser);
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

    if (!user.isVerified) {
        throw new AppError('Please verify your email before logging in', 403);
    }

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
