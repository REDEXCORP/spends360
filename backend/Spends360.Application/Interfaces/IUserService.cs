using Spends360.Application.Models.User;

namespace Spends360.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileResponse> GetProfileAsync(long userId);
}
