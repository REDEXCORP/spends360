import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const verifyRegistrationSchema = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, 'Workspace name is required'),
});

export const createRequestSchema = z.object({
    type: z.string().max(120).optional(),
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(5000).optional(),
    justification: z.string().max(5000).optional(),
    amount: z.coerce.number().nonnegative('Amount must be positive').optional(),
    currency: z.string().length(3).optional(),
    department: z.string().max(120).optional(),
    project: z.string().max(120).optional(),
    costCenter: z.string().max(120).optional(),
    vendor: z.string().max(150).optional(),
    category: z.string().max(120).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.iso.datetime({ offset: true }).optional().or(z.iso.date().optional()),
    tags: z.array(z.string().max(50)).max(20).optional(),
    approverIds: z
        .array(z.number().int().positive())
        .min(1, 'At least one approver is required')
        .max(20),
    assigneeId: z.number().int().positive().optional(),
});

export const approvalDecisionSchema = z.object({
    action: z.enum(['APPROVED', 'REJECTED']),
    comment: z.string().max(2000).optional(),
});

export const createRequestCommentSchema = z.object({
    body: z.string().min(1, 'Comment is required').max(2000),
});
