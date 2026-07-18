import { buildEmailHtml, buildEmailText } from './emailLayout';

export function buildRegisterEmail() {
    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Your Reach account was created successfully.</p>
<p>You can sign in with your email and password.</p>
`);

    const text = buildEmailText(`Hello,

Your Reach account was created successfully.

You can sign in with your email and password.`);

    return { html, text };
}
