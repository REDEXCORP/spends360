namespace Spends360.Application.Options;

public class AuthOptions
{
    public const string SectionName = "Auth";

    public string FrontendUrl { get; set; } = "http://localhost:3000";
    public int LoginOtpIntervalDays { get; set; } = 7;
    public int RegistrationTokenMinutes { get; set; } = 10;
    public int LoginOtpMinutes { get; set; } = 5;
    public string AccessTokenCookieName { get; set; } = "access_token_reach";
    public int AccessTokenMinutes { get; set; } = 100;
}
