using System.ComponentModel.DataAnnotations;

namespace Spends360.Application.Models.Auth;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "Please enter a valid email address")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password must be at least 6 characters")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "Please confirm your password")]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; init; } = string.Empty;
}

public sealed class VerifyRegisterRequest
{
    [Required(ErrorMessage = "Please enter a valid email address")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "Enter the 6-digit code")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Enter the 6-digit code")]
    public string Otp { get; init; } = string.Empty;

    [Required(ErrorMessage = "Password must be at least 6 characters")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
    public string Password { get; init; } = string.Empty;
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
