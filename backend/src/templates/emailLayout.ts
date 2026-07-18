export const EMAIL_DISCLAIMER =
    'This is an automated message from Reach. Do not reply to this email. If you are not sure this email is for you, please do not click any links. If you did not request this, you can safely ignore it.';

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function buildEmailHtml(content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222; margin: 0; padding: 16px;">
${content}
<p style="margin-top: 24px; font-size: 12px; color: #666666;">${EMAIL_DISCLAIMER}</p>
</body>
</html>`;
}

export function buildEmailText(content: string): string {
    return `${content}\n\n---\n${EMAIL_DISCLAIMER}`;
}

export function formatHtmlLink(url: string, label: string): string {
    const safeUrl = escapeHtml(url);
    const safeLabel = escapeHtml(label);

    return `<p style="margin: 24px 0;">
  <a href="${safeUrl}" style="display: inline-block; background-color: #492FA6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
    ${safeLabel}
  </a>
</p>`;
}

export function formatTextLink(url: string, label: string): string {
    return `${label}: ${url}`;
}

export function formatHtmlCode(code: string): string {
    return `<p style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">${escapeHtml(code)}</p>`;
}
