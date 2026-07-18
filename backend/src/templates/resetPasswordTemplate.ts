import { buildEmailHtml, buildEmailText, formatHtmlCode } from './emailLayout';

export function buildResetPasswordEmail(otp: string) {
    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Use this code to reset your Reach password:</p>
${formatHtmlCode(otp)}
<p>This code expires in 15 minutes.</p>
`);

    const text = buildEmailText(`Hello,

Use this code to reset your Reach password:

${otp}

This code expires in 15 minutes.`);

    return { html, text };
}
