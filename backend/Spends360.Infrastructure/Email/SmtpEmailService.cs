using System.Security.Authentication;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using Spends360.Application.Interfaces;
using Spends360.Infrastructure.Options;

namespace Spends360.Infrastructure.Email;

public class SmtpEmailService(IOptions<SmtpOptions> smtp) : IEmailService
{
    private readonly SmtpOptions _smtp = smtp.Value;

    public async Task SendRegistrationVerificationAsync(string toEmail, string verifyLink)
    {
        var (bodyHtml, text) = EmailTemplates.RegistrationVerification(verifyLink);
        await SendAsync(toEmail, "Spends360: verify your email", bodyHtml, text);
    }

    public async Task SendLoginOtpAsync(string toEmail, string otp)
    {
        var (bodyHtml, text) = EmailTemplates.LoginOtp(otp);
        await SendAsync(toEmail, "Spends360: login verification code", bodyHtml, text);
    }

    private async Task SendAsync(string toEmail, string subject, string bodyHtml, string text)
    {
        var host = _smtp.Host;
        var user = _smtp.User;
        var pass = _smtp.Pass;

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(user) || string.IsNullOrWhiteSpace(pass))
        {
            throw new InvalidOperationException("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set");
        }

        var from = string.IsNullOrWhiteSpace(_smtp.From) ? user : _smtp.From;
        var replyTo = string.IsNullOrWhiteSpace(_smtp.ReplyTo) ? user : _smtp.ReplyTo;
        var html = EmailLayout.WrapHtml(bodyHtml);
        var plainText = EmailLayout.WrapText(text);

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.ReplyTo.Add(MailboxAddress.Parse(replyTo));
        message.Subject = subject;
        message.Headers.Add("X-Mailer", "Spends360 Mail");
        message.Headers.Add("Precedence", "auto");
        message.Body = new BodyBuilder { TextBody = plainText, HtmlBody = html }.ToMessageBody();

        using var client = new SmtpClient { SslProtocols = SslProtocols.Tls12 };
        var secureSocketOptions = _smtp.Port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
        await client.ConnectAsync(host, _smtp.Port, secureSocketOptions);
        await client.AuthenticateAsync(user, pass);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
