import { Router } from 'express';
import { login, register, verifyOtp, refreshToken } from '../controllers/authController';
import { loginSchema, registerSchema, verifyOtpSchema } from '../utils/validations';
import { zodValidator } from '../middleware/zod-validator';

const router = Router();

router.post('/register', zodValidator({ body: registerSchema }), register);
router.post('/verify-otp', zodValidator({ body: verifyOtpSchema }), verifyOtp);
router.post('/login', zodValidator({ body: loginSchema }), login);
router.post('/refresh', refreshToken);

export default router;
