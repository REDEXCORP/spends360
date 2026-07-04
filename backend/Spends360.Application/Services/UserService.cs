using Spends360.Application.Exceptions;
using Spends360.Application.Interfaces;
using Spends360.Application.Models.User;

namespace Spends360.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _users;

    public UserService(IUserRepository users)
    {
        _users = users;
    }

    public async Task<UserProfileResponse> GetProfileAsync(long userId)
    {
        var user = await _users.GetByIdAsync(userId);
        if (user is null)
        {
            throw new AppException("User not found", 404);
        }

        return new UserProfileResponse
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
}
