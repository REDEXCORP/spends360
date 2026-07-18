import { Router } from 'express';
import express from 'express';
import { handlePaddleWebhook } from '../controllers/paddleWebhookController';

const router = Router();

router.post('/', express.raw({ type: 'application/json' }), handlePaddleWebhook);

export default router;
