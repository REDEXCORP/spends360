import { asyncHandler } from '../middleware/async-handler';
import { Request, Response } from 'express';
import nacl from 'tweetnacl';
import { createCallLog } from '../services/calls';
import { getTelnyxConfigs } from '../config/telnyx';
import { TelnyxClientConfig } from '../utils/interfaces';

function verifyTelnyxSignature(
    rawBody: string,
    signature: string,
    timestamp: string,
    publicKey: string
): boolean {
    const payloadToVerify = `${timestamp}|${rawBody}`;
    const messageBytes = Buffer.from(payloadToVerify, 'utf8');
    const signatureBytes = Buffer.from(signature, 'base64');
    const publicKeyBytes = Buffer.from(publicKey.replace(/['"\s\r\n]/g, '').trim(), 'base64');

    return nacl.sign.detached.verify(
        new Uint8Array(messageBytes),
        new Uint8Array(signatureBytes),
        new Uint8Array(publicKeyBytes)
    );
}

async function findVerifiedClient(
    rawBody: string,
    signature: string,
    timestamp: string
): Promise<TelnyxClientConfig | undefined> {
    const configs = await getTelnyxConfigs();
    return configs.find((config) =>
        verifyTelnyxSignature(rawBody, signature, timestamp, config.publicKey)
    );
}

export const telnyxWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signatureHeader = req.headers['telnyx-signature-ed25519'] as string;
    const timestampHeader = req.headers['telnyx-timestamp'] as string;
    const rawBodyString = req.body.toString('utf8');

    const clientConfig = await findVerifiedClient(rawBodyString, signatureHeader, timestampHeader);

    if (!clientConfig) {
        return res.status(400).send('Invalid Telnyx signature.');
    }

    res.status(200).json({ received: true });

    const event = JSON.parse(rawBodyString);
    console.log(JSON.stringify(event.data, null, 2));

    switch (event.data?.event_type) {
        case 'call.initiated':
            break;
        case 'call.hangup':
            const callLog = {
                fromNumber: event.data?.payload?.from,
                toNumber: event.data?.payload?.to,
                statusReason: event.data?.payload?.hangup_cause,
                callId: event.data?.payload?.call_leg_id,
                startTime: new Date(event.data?.payload?.start_time),
                endTime: new Date(event.data?.payload?.end_time),
                workspaceId: clientConfig.workspaceId,
            };
            await createCallLog(callLog);
            break;
        case 'call.answered':
            break;
        default:
            console.log('Unknown event type:', event.data?.event_type);
            break;
    }
});
