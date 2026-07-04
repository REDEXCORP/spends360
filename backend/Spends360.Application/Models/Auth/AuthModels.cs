namespace Spends360.Application.Models.Auth;

public sealed class RegisterRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
    public required string ConfirmPassword { get; init; }
}

public sealed class VerifyRegisterRequest
{
    public required string Email { get; init; }
    public required string Otp { get; init; }
    public required string Password { get; init; }
}

public sealed class LoginRequest
{
    public required string Email { get; init; }
    public required string Password { get; init; }
}

public sealed class VerifyOtpRequest
{
    public required string Email { get; init; }
    public required string Otp { get; init; }
    public required string Password { get; init; }
}

public sealed class RegisterResponse
{
    public required string Message { get; init; }
    public required string Email { get; init; }
}

public sealed class MessageResponse
{
    public required string Message { get; init; }
}

public sealed class LoginResponse
{
    public required string Message { get; init; }
    public required bool RequiresOtp { get; init; }
    public required string Email { get; init; }
    public UserDto? User { get; init; }
}

public sealed class LoginSuccessResponse
{
    public required string Message { get; init; }
    public required UserDto User { get; init; }
}

public sealed class UserDto
{
    public long Id { get; init; }
    public required string Email { get; init; }
    public bool IsVerified { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }
    public DateTimeOffset? LastLoginAt { get; init; }
    public string? LastLoginIp { get; init; }
}
