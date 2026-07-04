using Microsoft.AspNetCore.Mvc;

namespace Spends360.API.Extentions;

public static class ControllerExtensions
{
    public static IMvcBuilder AddApiControllers(this IServiceCollection services)
    {
        return services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var error = context.ModelState.Values
                        .SelectMany(entry => entry.Errors)
                        .Select(entry => entry.ErrorMessage)
                        .FirstOrDefault(message => !string.IsNullOrWhiteSpace(message))
                        ?? "Validation failed";

                    return new BadRequestObjectResult(new { error });
                };
            });
    }
}
