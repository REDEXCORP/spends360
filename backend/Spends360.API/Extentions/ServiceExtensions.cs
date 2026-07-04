using Spends360.Application.Interfaces;
using Spends360.Application.Services;

namespace Spends360.API.Extentions;

public static class ServiceExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        
        return services;
    }
}