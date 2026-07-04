namespace Spends360.Application.Models.User;

public sealed class UserProfileResponse
{
    public long Id { get; init; }
    public required string Email { get; init; }
    public bool IsVerified { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
    public DateTimeOffset? LastLoginAt { get; init; }
    public string? LastLoginIp { get; init; }
}
