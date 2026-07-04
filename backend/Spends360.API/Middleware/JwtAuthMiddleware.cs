using Microsoft.Extensions.Options;
using Spends360.Application.Interfaces;
using Spends360.Application.Options;

namespace Spends360.API.Middleware;

public class JwtAuthMiddleware
{
    public const string UserIdItemKey = "UserId";

    private readonly RequestDelegate _next;

    public JwtAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IJwtTokenService jwt, IOptions<AuthOptions> authOptions)
    {
        var cookieName = authOptions.Value.AccessTokenCookieName;
        var token = context.Request.Cookies[cookieName];

        if (!string.IsNullOrWhiteSpace(token))
        {
            try
            {
                context.Items[UserIdItemKey] = jwt.ValidateAccessToken(token);
            }
            catch
            {
                context.Items.Remove(UserIdItemKey);
            }
        }

        await _next(context);
    }
}
