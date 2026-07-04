import * as usersRepository from '../repositories/usersRepository';
import * as workspaceMembersRepository from '../repositories/workspaceMembersRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import { AppError } from '../utils/AppError';
import { AuthService } from '../infrastructure/auth';
import { CookieConfig } from '../infrastructure/cookie';
import { Response } from 'express';
import { getUsernameFromEmail, removePassword } from '../utils';
import { getDateWithOffset } from '../utils/dateUtils';
import { sendEmail } from './emailService';
import { buildOtpEmail } from '../templates/otpTemplate';
import { buildRegisterVerificationEmail } from '../templates/registerVerificationTemplate';
import { buildResetPasswordEmail } from '../templates/resetPasswordTemplate';
import { LOGIN_OTP_INTERVAL_MS } from '../config/auth';

const requiresLoginOtp = (user: { lastLoginAt?: Date | null; lastLoginIp?: string | null }, clientIp: string) => {
    if (!user.lastLoginAt || !user.lastLoginIp) return true;

    const lastLoginExpired = Date.now() - new Date(user.lastLoginAt).getTime() > LOGIN_OTP_INTERVAL_MS;
    const isDifferentIp = user.lastLoginIp !== clientIp;

    return lastLoginExpired || isDifferentIp;
};

export const generateTokensAndSetCookies = async (user: any, res: Response) => {
    const membership =
        (await workspaceMembersRepository.getUserDefaultWorkspace(user.id)) ??
        (await workspaceMembersRepository.getUserFirstAcceptedWorkspace(user.id));
    const workspaceId = membership?.workspaceId ?? null;
    const role = membership?.role ?? null;
    const accessToken = AuthService.generateAccessToken(user.id, role, workspaceId);

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
        const { html, text } = buildOtpEmail(otp);
        await sendEmail({ to: normalizedEmail, subject: 'Reach: login verification code', html, text });
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
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await usersRepository.getUserByEmail(normalizedEmail);
    const passwordHash = await AuthService.hashPassword(password);

    if (existingUser) {
        if (existingUser.isVerified) {
            throw new AppError('Please sign in. This email is already registered.', 400);
        }

        await usersRepository.update(existingUser.id, { password: passwordHash });
    } else {
        await createUserWithOwnWorkspace(normalizedEmail, passwordHash, false);
    }

    const token = AuthService.generateRegistrationToken({ email: normalizedEmail });

    const verifyLink = `${process.env.FRONTEND_URL}/register/verify?token=${encodeURIComponent(token)}`;

    try {
        const { html, text } = buildRegisterVerificationEmail(verifyLink);
        await sendEmail({ to: normalizedEmail, subject: 'Reach: verify your email', html, text });
    } catch (emailError: any) {
        throw new AppError('Failed to send verification email. Please try again later.', 500);
    }

    return {
        message: 'Verification link sent. Check your email to finish creating your account.',
        email: normalizedEmail,
    };
};

async function createUserWithOwnWorkspace(email: string, passwordHash: string, isVerified = false) {
    const workspaceName = `${getUsernameFromEmail(email)}'s Workspace`;
    const workspace = await workspaceRepository.create(workspaceName);

    const user = await usersRepository.create({
        email,
        password: passwordHash,
        isVerified,
    });

    await workspaceRepository.updateOwner(workspace.id, user.id);

    await workspaceMembersRepository.create({
        userId: user.id,
        workspaceId: workspace.id,
        role: 'ADMIN',
        isDefault: true,
        inviteAccepted: true,
        createdBy: user.id,
        updatedBy: user.id,
    });

    return user;
}

export const verifyRegistration = async (token: string) => {
    let payload;
    try {
        payload = AuthService.verifyRegistrationToken(token);
    } catch {
        throw new AppError('Invalid or expired verification link', 401);
    }

    const user = await usersRepository.getUserByEmail(payload.email);
    if (!user) {
        throw new AppError('Account not found. Please register again.', 400);
    }

    if (user.isVerified) {
        throw new AppError('Email already verified. Please sign in.', 400);
    }

    await usersRepository.update(user.id, { isVerified: true });

    return {
        message: 'Email verified. You can now sign in.',
    };
};

export const forgotPassword = async (email: string) => {
    const user = await usersRepository.getUserByEmail(email);

    if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = getDateWithOffset(15);

        await usersRepository.update(user.id, { otp, otpExpiresAt });

        try {
            const { html, text } = buildResetPasswordEmail(otp);
            await sendEmail({
                to: email,
                subject: 'Reach: password reset code',
                html,
                text,
            });
        } catch (emailError: any) {
            console.error('Failed to send reset email:', emailError.message || emailError);
            throw new AppError('Failed to send reset email. Please try again later.', 500);
        }
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
