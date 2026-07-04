using Spends360.Domain.Entities;

namespace Spends360.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(long id);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
}
