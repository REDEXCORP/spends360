using Spends360.Application.Interfaces;
using Spends360.Persistence.Repositories;

namespace Spends360.API.Extentions;

public static class RepositoryExtensions
{
    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
