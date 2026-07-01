import { asyncHandler } from '../middleware/async-handler';
import { Request, Response } from 'express';
import { loginSchema, registerSchema, verifyOtpSchema } from '../utils/validations';
import * as authService from '../services/authService';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = registerSchema.parse(req.body);
    const result = await authService.register(email, password);
    return res.status(201).json(result);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const user = await authService.verifyOtp(email, otp, res);
    return res.json({
        message: 'Account verified successfully',
        user,
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await authService.login(email, password, res);
    return res.json({
        message: 'Login successful',
        user,
    });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.refreshToken(req, res);
    return res.json({
        message: 'Token refreshed',
        user,
    });
});
