using System.Net;
using Microsoft.AspNetCore.Mvc;
using Spends360.Application.Interfaces;
using Spends360.Application.Models.Auth;

namespace Spends360.API.Controllers;

public class AuthController(
    IAuthService authService,
    IJwtTokenService jwt,
    IWebHostEnvironment environment) : BaseApiController
{
    private readonly IAuthService _authService = authService;
    private readonly IJwtTokenService _jwt = jwt;
    private readonly IWebHostEnvironment _environment = environment;

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPost("verify-register")]
    public async Task<ActionResult<LoginSuccessResponse>> VerifyRegister([FromBody] VerifyRegisterRequest request)
    {
        var clientIp = GetClientIp();
        var result = await _authService.VerifyRegistrationAsync(request, clientIp);
        SetAccessTokenCookie(_jwt.GenerateAccessToken(result.User.Id));
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        var clientIp = GetClientIp();
        var result = await _authService.LoginAsync(request, clientIp);

        if (!result.RequiresOtp && result.User is not null)
        {
            SetAccessTokenCookie(_jwt.GenerateAccessToken(result.User.Id));
        }

        return Ok(result);
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<LoginSuccessResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var clientIp = GetClientIp();
        var result = await _authService.VerifyOtpAsync(request, clientIp);
        SetAccessTokenCookie(_jwt.GenerateAccessToken(result.User.Id));
        return Ok(result);
    }

    private string? GetClientIp()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded) &&
            IPAddress.TryParse(forwarded.Split(',')[0].Trim(), out var forwardedIp))
        {
            return ToStoredClientIp(forwardedIp);
        }

        return ToStoredClientIp(HttpContext.Connection.RemoteIpAddress);
    }

    private static string? ToStoredClientIp(IPAddress? ip)
    {
        if (ip is null || IPAddress.IsLoopback(ip))
        {
            return null;
        }

        return ip.ToString();
    }

    private void SetAccessTokenCookie(string token)
    {
        var isProd = _environment.IsProduction();

        Response.Cookies.Append(
            Environment.GetEnvironmentVariable("AUTH_ACCESS_TOKEN_COOKIE_NAME") ?? "access_token_spends360",
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = isProd,
                SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                MaxAge = TimeSpan.FromMinutes(int.TryParse(Environment.GetEnvironmentVariable("AUTH_ACCESS_TOKEN_MINUTES"), out var minutes) ? minutes : 100),
            });
    }
}
