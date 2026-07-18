import { buildEmailHtml, buildEmailText, formatHtmlCode } from './emailLayout';

export function buildOtpEmail(otp: string) {
    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Your Reach login code is:</p>
${formatHtmlCode(otp)}
<p>This code expires in 5 minutes.</p>
`);

    const text = buildEmailText(`Hello,

Your Reach login code is:

${otp}

This code expires in 5 minutes.`);

    return { html, text };
}
