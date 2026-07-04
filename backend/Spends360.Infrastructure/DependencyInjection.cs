using Microsoft.Extensions.DependencyInjection;
using Spends360.Application.Interfaces;
using Spends360.Application.Services;
using Spends360.Infrastructure.Email;
using Spends360.Infrastructure.Options;
using Spends360.Infrastructure.Security;

namespace Spends360.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        return services;
    }

    public static IServiceCollection AddAppOptions(this IServiceCollection services)
    {
        services.Configure<JwtOptions>(options =>
        {
            options.Secret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? options.Secret;
            if (int.TryParse(Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_MINUTES"), out var accessTokenMinutes))
                options.AccessTokenMinutes = accessTokenMinutes;
            if (int.TryParse(Environment.GetEnvironmentVariable("JWT_REGISTRATION_TOKEN_MINUTES"), out var registrationTokenMinutes))
                options.RegistrationTokenMinutes = registrationTokenMinutes;
        });
        services.Configure<SmtpOptions>(options =>
        {
            options.Host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? options.Host;
            if (int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port))
                options.Port = port;
            options.User = Environment.GetEnvironmentVariable("SMTP_USER") ?? options.User;
            options.Pass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? options.Pass;
            options.From = Environment.GetEnvironmentVariable("SMTP_FROM") ?? options.From;
            options.ReplyTo = Environment.GetEnvironmentVariable("SMTP_REPLY_TO") ?? options.ReplyTo;
        });
        return services;
    }
}
