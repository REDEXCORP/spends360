import { Request, Response } from 'express';
import { paddle, PADDLE_WEBHOOK_SECRET } from '../config/paddle';
import { applySubscriptionFromWebhook } from '../services/paddleWebhookService';

export const handlePaddleWebhook = async (req: Request, res: Response) => {
    const signature = (req.headers['paddle-signature'] as string) || '';
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');

    try {
        if (!signature || !rawBody) {
            return res.status(400).send('Missing signature or body');
        }

        const event = await paddle.webhooks.unmarshal(rawBody, PADDLE_WEBHOOK_SECRET, signature);
        await applySubscriptionFromWebhook(event.eventType, event.data);
        return res.status(200).send('ok');
    } catch (error) {
        console.error('[paddle webhook]', error);
        return res.status(400).send('Invalid webhook');
    }
};
