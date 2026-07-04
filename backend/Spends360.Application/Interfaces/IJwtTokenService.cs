namespace Spends360.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(long userId);
    string GenerateRegistrationToken(string email);
    string ValidateRegistrationToken(string token);
    long ValidateAccessToken(string token);
}
