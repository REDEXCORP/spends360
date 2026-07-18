import { Router } from 'express';
import {
    forgotPassword,
    login,
    logout,
    register,
    resetPassword,
    verifyOtp,
    verifyRegistration,
} from '../controllers/authController';
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from '../utils/validations';
import { zodValidator } from '../middleware/zod-validator';

const router = Router();

router.post('/register', zodValidator({ body: registerSchema }), register);
router.post('/verify-register', verifyRegistration);
router.post('/login', zodValidator({ body: loginSchema }), login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', zodValidator({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', zodValidator({ body: resetPasswordSchema }), resetPassword);
router.post('/logout', logout);

export default router;
