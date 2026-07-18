import { buildEmailHtml, buildEmailText, formatHtmlLink, formatTextLink } from './emailLayout';

export function buildRegisterVerificationEmail(link: string) {
    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Please verify your email to finish creating your Reach account.</p>
${formatHtmlLink(link, 'Verify email')}
<p>This link expires in 10 minutes.</p>
`);

    const text = buildEmailText(`Hello,

Please verify your email to finish creating your Reach account.

${formatTextLink(link, 'Verify email')}

This link expires in 10 minutes.`);

    return { html, text };
}
