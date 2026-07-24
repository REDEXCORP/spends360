import * as usersRepository from '../repositories/usersRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import { AppError } from '../utils/AppError';
import { AuthService } from '../infrastructure/auth';
import { CookieConfig } from '../infrastructure/cookie';
import { Response } from 'express';
import { getUsernameFromEmail, normalizedEmails, removePassword } from '../utils';
import { getDateWithOffset } from '../utils/dateUtils';
import { sendEmail } from './emailService';
import { buildOtpEmail } from '../templates/otpTemplate';
import { buildResetPasswordEmail } from '../templates/resetPasswordTemplate';
import { LOGIN_OTP_INTERVAL_MS } from '../config/auth';

const requiresLoginOtp = (user: { lastLoginAt?: Date | null; lastLoginIp?: string | null }, clientIp: string) => {
    if (!user.lastLoginAt || !user.lastLoginIp) return true;

    const lastLoginExpired = Date.now() - new Date(user.lastLoginAt).getTime() > LOGIN_OTP_INTERVAL_MS;
    const isDifferentIp = user.lastLoginIp !== clientIp;

    return lastLoginExpired || isDifferentIp;
};

export const generateTokensAndSetCookies = async (user: any, res: Response) => {
    const membership = await workspaceMembersRepository.getUserDefaultWorkspace(user.id);
    
    const accessToken = AuthService.generateAccessToken(user.id, membership.role, membership.workspaceId);

    CookieConfig.setCookie(res, CookieConfig.ACCESS_TOKEN_COOKIE_NAME, accessToken, 100 * 60 * 1000);

    return { accessToken };
};

const completeLogin = async (user: any, clientIp: string, res: Response) => {
    await usersRepository.update(user.id, {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        otp: null,
        otpExpiresAt: null,
    });

    await generateTokensAndSetCookies(user, res);

    return removePassword(user);
};

export const login = async (email: string, password: string, clientIp: string, res: Response) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await usersRepository.getUserByEmail(normalizedEmail);

    if (!user || !user.isVerified) throw new AppError('No account found. Please register.', 404);

    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    if (!requiresLoginOtp(user, clientIp)) {
        const loggedInUser = await completeLogin(user, clientIp, res);
        return { requiresOtp: false, email: normalizedEmail, user: loggedInUser };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = getDateWithOffset(5);

    await usersRepository.update(user.id, { otp, otpExpiresAt });

    try {
        const { html, text } = buildOtpEmail(otp, 'login');
        await sendEmail({ to: normalizedEmail, subject: 'Spends360: login verification code', html, text });
    } catch {
        throw new AppError('Failed to send OTP email. Please try again later.', 500);
    }

    return { requiresOtp: true, email: normalizedEmail };
};

export const verifyOtp = async (email: string, otp: string, password: string, clientIp: string, res: Response) => {
    const user = await usersRepository.getUserByEmail(email);
    if (!user) throw new AppError('Invalid request', 400);

    const isMatch = await AuthService.comparePassword(password, user.password);
    if (!isMatch) throw new AppError('Invalid password', 401);

    if (!user.otp || !user.otpExpiresAt || user.otp !== otp || new Date() > user.otpExpiresAt) {
        throw new AppError('Invalid or expired OTP', 401);
    }

    return completeLogin(user, clientIp, res);
};

export const logout = async (res: Response) => {
    CookieConfig.clearCookie(res, CookieConfig.ACCESS_TOKEN_COOKIE_NAME);
};

export const register = async (email: string, password: string) => {
    const normalizedEmail = normalizedEmails(email);
    const existingUser = await usersRepository.getUserByEmail(normalizedEmail);
    const passwordHash = await AuthService.hashPassword(password);

    if (existingUser) {
        if (existingUser.isVerified) {
            throw new AppError('Please sign in. This email is already registered.', 400);
        }

        await usersRepository.update(existingUser.id, { password: passwordHash });
    } else {
        await usersRepository.create({ email: normalizedEmail, password: passwordHash, isVerified: false });
    }

    const user = await usersRepository.getUserByEmail(normalizedEmail);
    if (!user) {
        throw new AppError('Failed to create account. Please try again.', 500);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = getDateWithOffset(10);

    await usersRepository.update(user.id, { otp, otpExpiresAt });

    try {
        const { html, text } = buildOtpEmail(otp, 'registration');
        await sendEmail({
            to: normalizedEmail,
            subject: 'Spends360: registration verification code',
            html,
            text,
        });
    } catch {
        throw new AppError('Failed to send OTP email. Please try again later.', 500);
    }

    return {
        message: 'OTP sent. Check your email to finish creating your account.',
        email: normalizedEmail,
        requiresOtp: true,
    };
};

async function createWorkspaceForUser(userId: number, email: string) {

    const workspaceName = `${getUsernameFromEmail(email)}'s Workspace`;
    const workspace = await workspaceRepository.create(workspaceName, userId);

    await workspaceMembersRepository.create({
        userId,
        workspaceId: workspace.id,
        role: 'ADMIN',
        inviteAccepted: true,
        createdBy: userId,
        updatedBy: userId,
    });

    return await workspaceMembersRepository.setDefaultWorkspace(userId, workspace.id);
}

export const verifyRegistration = async (email: string, otp: string, clientIp: string, res: Response) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await usersRepository.getUserByEmail(normalizedEmail);

    if (!user) {
        throw new AppError('Account not found. Please register again.', 400);
    }

    if (user.isVerified) {
        throw new AppError('Email already verified. Please sign in.', 400);
    }

    if (!user.otp || !user.otpExpiresAt || user.otp !== otp || new Date() > user.otpExpiresAt) {
        throw new AppError('Invalid or expired OTP', 401);
    }

    await usersRepository.update(user.id, { isVerified: true, otp: null, otpExpiresAt: null });
    await createWorkspaceForUser(user.id, normalizedEmail);

    const verifiedUser = await usersRepository.getUserById(user.id);
    const loggedInUser = await completeLogin(verifiedUser!, clientIp, res);

    return {
        message: 'Email verified. Welcome!',
        email: normalizedEmail,
        user: loggedInUser,
    };
};

export const forgotPassword = async (email: string) => {
    const user = await usersRepository.getUserByEmail(email);

    if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = getDateWithOffset(15);

        await usersRepository.update(user.id, { otp, otpExpiresAt });

        const { html, text } = buildResetPasswordEmail(otp);
        await sendEmail({
            to: email,
            subject: 'Reach: password reset code',
            html,
            text,
        });
    }

    return {
        message: 'If an account exists for this email, a reset code has been sent.',
        email,
    };
};

export const resetPassword = async (email: string, otp: string, password: string) => {
    const user = await usersRepository.getUserByEmail(email);
    if (!user) {
        throw new AppError('Invalid request', 400);
    }

    if (!user.otp || !user.otpExpiresAt || user.otp !== otp || new Date() > user.otpExpiresAt) {
        throw new AppError('Invalid or expired reset code', 401);
    }

    const hashedPassword = await AuthService.hashPassword(password);
    await usersRepository.update(user.id, {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
    });

    return {
        message: 'Password reset successfully. You can now sign in.',
        email,
    };
};
