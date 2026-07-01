import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { wrapEmailHtml } from '../templates/emailLayout';
import { SendMailOptions } from '../utils/interfaces';

export class MailService {
    private static transporter: Transporter | null = null;

    private static getTransporter(): Transporter {
        if (!this.transporter) {
            const host = process.env.SMTP_HOST;
            const port = Number(process.env.SMTP_PORT || 465);
            const user = process.env.SMTP_USER;
            const pass = process.env.SMTP_PASS;

            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
                tls: { minVersion: 'TLSv1.2' },
            });
        }

        return this.transporter;
    }

    static async sendMail({ to, subject, text, html, replyTo }: SendMailOptions) {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER;
        const defaultReplyTo = process.env.SMTP_REPLY_TO || process.env.SMTP_USER;
        const htmlContent = html ? wrapEmailHtml(html) : undefined;

        if (!text && !htmlContent) {
            throw new Error('Either text or html content is required');
        }

        return this.getTransporter().sendMail({
            from,
            to,
            replyTo: replyTo ?? defaultReplyTo,
            subject,
            text,
            html: htmlContent,
            headers: {
                'X-Mailer': 'Spends360 Mail',
                Precedence: 'auto',
            },
        });
    }
}
