import { buildEmailHtml, buildEmailText, formatHtmlCode } from './emailLayout';

type OtpPurpose = 'login' | 'registration';

export function buildOtpEmail(otp: string, purpose: OtpPurpose = 'login') {
    const purposeLabel = purpose === 'registration' ? 'registration' : 'login';

    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Your Spends360 ${purposeLabel} code is:</p>
${formatHtmlCode(otp)}
<p>This code expires in ${purpose === 'registration' ? '10' : '5'} minutes.</p>
`);

    const text = buildEmailText(`Hello,

Your Spends360 ${purposeLabel} code is:

${otp}

This code expires in ${purpose === 'registration' ? '10' : '5'} minutes.`);

    return { html, text };
}
