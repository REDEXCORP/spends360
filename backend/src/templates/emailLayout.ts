export const APP_NAME = process.env.APP_NAME || 'Spends360';

export function wrapEmailHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${APP_NAME}</title>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f4f4f5; padding: 32px 16px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 560px;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 32px;
            "
          >
            <tr>
              <td style="color: #18181b; font-size: 16px; line-height: 1.6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td
                style="
                  padding-top: 24px;
                  border-top: 1px solid #e4e4e7;
                  color: #71717a;
                  font-size: 12px;
                  line-height: 1.5;
                "
              >
                <p style="margin: 0;">${APP_NAME}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
