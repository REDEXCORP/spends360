import { buildEmailHtml, buildEmailText, escapeHtml } from './emailLayout';

export function buildWelcomeEmail(email: string, password: string) {
    const safeEmail = escapeHtml(email);

    const html = buildEmailHtml(`
<p>Hello,</p>
<p>An administrator created a Reach account for you.</p>
<p>Email: ${safeEmail}<br>Password: ${escapeHtml(password)}</p>
<p>Please sign in and change your password.</p>
`);

    const text = buildEmailText(`Hello,

An administrator created a Reach account for you.

Email: ${email}
Password: ${password}

Please sign in and change your password.`);

    return { html, text };
}
