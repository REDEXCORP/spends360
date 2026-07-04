namespace Spends360.Infrastructure.Email;

internal static class EmailTemplates
{
    public static (string BodyHtml, string Text) RegistrationVerification(string verifyLink)
    {
        var bodyHtml =
            $"""
            <p>Hello,</p>
            <p>Please verify your email to finish creating your account.</p>
            {EmailLayout.FormatHtmlLink(verifyLink, "Verify email")}
            <p>This link expires in 10 minutes.</p>
            """;

        var text =
            $"""
            Hello,

            Please verify your email to finish creating your account.

            Verify email: {verifyLink}

            This link expires in 10 minutes.
            """;

        return (bodyHtml, text);
    }

    public static (string BodyHtml, string Text) LoginOtp(string otp)
    {
        var bodyHtml =
            $"""
            <p>Hello,</p>
            <p>Your login code is:</p>
            {EmailLayout.FormatHtmlCode(otp)}
            <p>This code expires in 5 minutes.</p>
            """;

        var text =
            $"""
            Hello,

            Your login code is:

            {otp}

            This code expires in 5 minutes.
            """;

        return (bodyHtml, text);
    }
}
