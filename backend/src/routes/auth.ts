import { Router } from 'express';
import { login, register, verifyUser, refreshToken } from '../controllers/authController';
import { loginSchema, registerSchema, verifyUserSchema } from '../utils/validations';
import { zodValidator } from '../middleware/zod-validator';

const router = Router();

router.post('/register', zodValidator({ body: registerSchema }), register);
router.post('/verify', zodValidator({ body: verifyUserSchema }), verifyUser);
router.post('/login', zodValidator({ body: loginSchema }), login);
router.post('/refresh', refreshToken);

export default router;
