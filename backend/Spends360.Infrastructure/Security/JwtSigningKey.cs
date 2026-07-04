using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Spends360.Infrastructure.Security;

public static class JwtSigningKey
{
    public static SymmetricSecurityKey Create(string secret)
    {
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("JWT_SECRET_KEY must be configured.");
        }

        var keyBytes = Encoding.UTF8.GetBytes(secret);
        if (keyBytes.Length < 32)
        {
            keyBytes = SHA256.HashData(keyBytes);
        }

        return new SymmetricSecurityKey(keyBytes);
    }
}
