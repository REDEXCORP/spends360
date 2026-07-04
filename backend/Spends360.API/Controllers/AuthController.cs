using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Spends360.Application.Interfaces;
using Spends360.Application.Models.Auth;
using Spends360.Application.Options;

namespace Spends360.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IJwtTokenService _jwt;
    private readonly AuthOptions _authOptions;
    private readonly IWebHostEnvironment _environment;

    public AuthController(
        IAuthService authService,
        IJwtTokenService jwt,
        IOptions<AuthOptions> authOptions,
        IWebHostEnvironment environment)
    {
        _authService = authService;
        _jwt = jwt;
        _authOptions = authOptions.Value;
        _environment = environment;
    }

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

    private string GetClientIp()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
        {
            return forwarded.Split(',')[0].Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private void SetAccessTokenCookie(string token)
    {
        var isProd = _environment.IsProduction();
        Response.Cookies.Append(
            _authOptions.AccessTokenCookieName,
            token,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = isProd,
                SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax,
                Path = "/",
                MaxAge = TimeSpan.FromMinutes(_authOptions.AccessTokenMinutes),
            });
    }
}
