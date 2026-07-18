import {
    buildEmailHtml,
    buildEmailText,
    escapeHtml,
    formatHtmlLink,
    formatTextLink,
} from './emailLayout';

export function buildWorkspaceInviteEmail(workspaceName: string, role: string, link: string) {
    const safeWorkspace = escapeHtml(workspaceName);
    const safeRole = escapeHtml(role);

    const html = buildEmailHtml(`
<p>Hello,</p>
<p>You were invited to join the workspace <strong>${safeWorkspace}</strong> on Reach as ${safeRole}.</p>
${formatHtmlLink(link, 'Accept invitation')}
<p>The link expires in 7 days. If you do not have an account yet, you will be asked to create one.</p>
`);

    const text = buildEmailText(`Hello,

You were invited to join the workspace "${workspaceName}" on Reach as ${role}.

${formatTextLink(link, 'Accept invitation')}

The link expires in 7 days. If you do not have an account yet, you will be asked to create one.`);

    return { html, text };
}
