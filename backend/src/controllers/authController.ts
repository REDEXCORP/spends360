import { asyncHandler } from '../middleware/async-handler';
import { Request, Response } from 'express';
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from '../utils/validations';
import * as authService from '../services/authService';
import { getClientIp } from '../utils';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = registerSchema.parse(req.body);
    const result = await authService.register(email, password);
    return res.status(201).json(result);
});

export const verifyRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body ?? {};
    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const clientIp = getClientIp(req);
    const result = await authService.verifyRegistration(email, otp, clientIp, res);
    return res.json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const clientIp = getClientIp(req);
    const result = await authService.login(email, password, clientIp, res);
    return res.json({
        message: result.requiresOtp ? 'OTP sent to your email' : 'Login successful',
        ...result,
    });
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, password } = req.body;
    const clientIp = getClientIp(req);
    const user = await authService.verifyOtp(email, otp, password, clientIp, res);
    return res.json({
        message: 'Login successful',
        user,
    });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    return res.json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, password } = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(email, otp, password);
    return res.json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(res);
    return res.json({
        message: 'Logged out successfully',
    });
});
