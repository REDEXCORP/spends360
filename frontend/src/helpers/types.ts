import z from 'zod';
import { loginSchema, registerSchema, verifyOtpSchema } from './validation';

export type UserSchema = z.infer<typeof loginSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
