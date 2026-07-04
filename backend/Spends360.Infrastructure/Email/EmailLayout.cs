namespace Spends360.Infrastructure.Email;

internal static class EmailLayout
{
    private const string Disclaimer =
        "This is an automated message from Spends360. Do not reply to this email. If you are not sure this email is for you, please do not click any links. If you did not request this, you can safely ignore it.";

    public static string WrapHtml(string body) =>
        $"""
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"></head>
        <body style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222; margin: 0; padding: 16px;">
        {body}
        <p style="margin-top: 24px; font-size: 12px; color: #666666;">{Disclaimer}</p>
        </body>
        </html>
        """;

    public static string WrapText(string body) => $"{body}\n\n---\n{Disclaimer}";

    public static string EscapeHtml(string value) =>
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;");

    public static string FormatHtmlLink(string url, string label) =>
        $"""
        <p style="margin: 24px 0;">
          <a href="{EscapeHtml(url)}" style="display: inline-block; background-color: #492FA6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            {EscapeHtml(label)}
          </a>
        </p>
        """;

    public static string FormatHtmlCode(string code) =>
        $"""<p style="font-size: 18px; font-weight: bold; letter-spacing: 2px;">{EscapeHtml(code)}</p>""";
}
