using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Spends360.Application.Interfaces;
using Spends360.Infrastructure.Options;

namespace Spends360.Infrastructure.Security;

public class JwtTokenService : IJwtTokenService
{
    private readonly JwtOptions _options;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
        _signingKey = CreateSigningKey(_options.Secret);
    }

    public string GenerateAccessToken(long userId)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
        };

        return CreateToken(claims, TimeSpan.FromMinutes(_options.AccessTokenMinutes));
    }

    public string GenerateRegistrationToken(string email)
    {
        var claims = new[] { new Claim("email", email.Trim().ToLowerInvariant()) };
        return CreateToken(claims, TimeSpan.FromMinutes(_options.RegistrationTokenMinutes));
    }

    public string ValidateRegistrationToken(string token)
    {
        var principal = ValidateToken(token);
        var email = principal.FindFirst("email")?.Value;
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new SecurityTokenException("Invalid registration token");
        }

        return email;
    }

    public long ValidateAccessToken(string token)
    {
        var principal = ValidateToken(token);
        var subject = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!long.TryParse(subject, out var userId))
        {
            throw new SecurityTokenException("Invalid access token");
        }

        return userId;
    }

    private string CreateToken(IEnumerable<Claim> claims, TimeSpan lifetime)
    {
        var credentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.Add(lifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }

    private ClaimsPrincipal ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();

        return handler.ValidateToken(
            token,
            new TokenValidationParameters
            {
                ValidateIssuer = !string.IsNullOrWhiteSpace(_options.Issuer),
                ValidIssuer = _options.Issuer,
                ValidateAudience = !string.IsNullOrWhiteSpace(_options.Audience),
                ValidAudience = _options.Audience,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(1),
            },
            out _);
    }

    private static SymmetricSecurityKey CreateSigningKey(string secret)
    {
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("Jwt:Secret must be configured.");
        }

        var keyBytes = Encoding.UTF8.GetBytes(secret);
        if (keyBytes.Length < 32)
        {
            keyBytes = SHA256.HashData(keyBytes);
        }

        return new SymmetricSecurityKey(keyBytes);
    }
}
