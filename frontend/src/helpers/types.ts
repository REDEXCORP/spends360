import z from 'zod';
import { loginSchema } from './validation';

export type UserSchema = z.infer<typeof loginSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
