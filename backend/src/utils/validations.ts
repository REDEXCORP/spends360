import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const verifyUserSchema = z.object({
    id: z.number().int().positive('Invalid user ID'),
});

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, 'Workspace name is required'),
});
