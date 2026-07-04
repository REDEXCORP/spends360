import { buildEmailHtml, buildEmailText, escapeHtml } from './emailLayout';

export function buildWorkspaceAddedEmail(email: string) {
    const safeEmail = escapeHtml(email);

    const html = buildEmailHtml(`
<p>Hello,</p>
<p>Your Reach account (${safeEmail}) was added to a workspace.</p>
<p>Sign in with your existing email and password to access it.</p>
`);

    const text = buildEmailText(`Hello,

Your Reach account (${email}) was added to a workspace.

Sign in with your existing email and password to access it.`);

    return { html, text };
}
