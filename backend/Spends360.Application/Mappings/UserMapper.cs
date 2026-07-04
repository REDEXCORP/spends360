using Spends360.Application.Models.Auth;
using Spends360.Domain.Entities;

namespace Spends360.Application.Mappings;

public static class UserMapper
{
    public static UserDto ToDto(User user) =>
        new()
        {
            Id = user.Id,
            Email = user.Email,
            IsVerified = user.IsVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            LastLoginAt = user.LastLoginAt,
            LastLoginIp = user.LastLoginIp,
        };
}
