import { Router } from 'express';
import { getCalls } from '../controllers/callsController';

const router = Router();

router.get('/', getCalls);

export default router;
