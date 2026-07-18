import nodemailer from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
};

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
    const replyTo = process.env.SMTP_REPLY_TO;

    const info = await getTransporter().sendMail({
        from,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
    });

    return { success: true, messageId: info.messageId };
};
