import { google } from 'googleapis';

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

function buildRawEmail(from: string, to: string, subject: string, html: string, text?: string): string {
    if (!text) {
        return [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset="UTF-8"',
            '',
            html,
        ].join('\r\n');
    }

    const boundary = `reach_${Date.now()}`;

    return [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        '',
        text,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        html,
        '',
        `--${boundary}--`,
    ].join('\r\n');
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    await oauth2Client.getAccessToken();

    const fromAddress = process.env.EMAIL_USER!;
    const from = `Reach <${fromAddress}>`;
    const emailBody = buildRawEmail(from, to, subject, html, text);
    const raw = Buffer.from(emailBody).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await google.gmail({ version: 'v1', auth: oauth2Client }).users.messages.send({
        userId: 'me',
        requestBody: { raw },
    });

    return { success: true, messageId: res.data.id };
};
