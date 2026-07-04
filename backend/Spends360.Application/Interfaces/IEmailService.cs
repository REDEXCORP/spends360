namespace Spends360.Application.Interfaces;

public interface IEmailService
{
    Task SendRegistrationVerificationAsync(string toEmail, string verifyLink);
    Task SendLoginOtpAsync(string toEmail, string otp);
}
