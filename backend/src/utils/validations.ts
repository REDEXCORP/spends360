import { z } from 'zod';
import { OTP_LENGTH } from '../constants/otp';

export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z
    .object({
        email: z.email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters long'),
        confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export const verifyOtpSchema = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().length(OTP_LENGTH, `Verification code must be ${OTP_LENGTH} digits`),
});

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, 'Workspace name is required'),
});
