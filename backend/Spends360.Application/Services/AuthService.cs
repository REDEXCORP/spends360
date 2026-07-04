using Spends360.Application.Exceptions;
using Spends360.Application.Interfaces;
using Spends360.Application.Mappings;
using Spends360.Application.Models.Auth;
using Spends360.Domain.Entities;

namespace Spends360.Application.Services;

public class AuthService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    IEmailService email) : IAuthService
{
    private readonly IUserRepository _users = users;
    private readonly IPasswordHasher _passwordHasher = passwordHasher;
    private readonly IEmailService _email = email;

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var email = NormalizeEmail(request.Email);
        var existing = await _users.GetByEmailAsync(email);
        var passwordHash = _passwordHasher.Hash(request.Password);
        string otp;

        if (existing is not null)
        {
            if (existing.IsVerified)
            {
                throw new AppException("Please sign in. This email is already registered.", 400);
            }

            existing.Password = passwordHash;
            otp = SetRegistrationOtp(existing);
            await _users.UpdateAsync(existing);
        }
        else
        {
            var user = new User
            {
                Email = email,
                Password = passwordHash,
                IsVerified = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            };
            otp = SetRegistrationOtp(user);
            await _users.CreateAsync(user);
        }

        await _email.SendLoginOtpAsync(email, otp);

        return new RegisterResponse
        {
            Message = "OTP sent to your email. Enter the code to finish creating your account.",
            Email = email,
        };
    }

    public async Task<LoginSuccessResponse> VerifyRegistrationAsync(VerifyRegisterRequest request, string? clientIp)
    {
        var email = NormalizeEmail(request.Email);

        var user = await _users.GetByEmailAsync(email);
        if (user is null)
        {
            throw new AppException("Account not found. Please register again.", 400);
        }

        if (user.IsVerified)
        {
            if (!_passwordHasher.Verify(request.Password, user.Password))
            {
                throw new AppException("Invalid password", 401);
            }

            var existingUser = await CompleteLoginAsync(user, clientIp);
            return new LoginSuccessResponse
            {
                Message = "Login successful.",
                User = existingUser,
            };
        }

        if (!_passwordHasher.Verify(request.Password, user.Password))
        {
            throw new AppException("Invalid password", 401);
        }

        if (!IsOtpValid(user, request.Otp))
        {
            throw new AppException("Invalid or expired OTP", 401);
        }

        user.IsVerified = true;
        var loggedInUser = await CompleteLoginAsync(user, clientIp);
        return new LoginSuccessResponse
        {
            Message = "Account verified. Login successful.",
            User = loggedInUser,
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, string? clientIp)
    {
        var email = NormalizeEmail(request.Email);

        var user = await _users.GetByEmailAsync(email);
        if (user is null || !user.IsVerified)
        {
            throw new AppException("No account found. Please register.", 404);
        }

        if (!_passwordHasher.Verify(request.Password, user.Password))
        {
            throw new AppException("Invalid email or password", 401);
        }

        if (!RequiresLoginOtp(user, clientIp))
        {
            var loggedInUser = await CompleteLoginAsync(user, clientIp);
            return new LoginResponse
            {
                Message = "Login successful",
                RequiresOtp = false,
                Email = email,
                User = loggedInUser,
            };
        }

        var otp = SetLoginOtp(user);
        await _users.UpdateAsync(user);

        try
        {
            await _email.SendLoginOtpAsync(email, otp);
        }
        catch
        {
            throw new AppException("Failed to send OTP email. Please try again later.", 500);
        }

        return new LoginResponse
        {
            Message = "OTP sent to your email",
            RequiresOtp = true,
            Email = email,
        };
    }

    public async Task<LoginSuccessResponse> VerifyOtpAsync(VerifyOtpRequest request, string? clientIp)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _users.GetByEmailAsync(email);

        if (user is null || !user.IsVerified)
        {
            throw new AppException("Invalid request", 400);
        }

        if (!_passwordHasher.Verify(request.Password, user.Password))
        {
            throw new AppException("Invalid password", 401);
        }

        if (!IsOtpValid(user, request.Otp))
        {
            throw new AppException("Invalid or expired OTP", 401);
        }

        var loggedInUser = await CompleteLoginAsync(user, clientIp);
        return new LoginSuccessResponse
        {
            Message = "Login successful",
            User = loggedInUser,
        };
    }

    private static string SetRegistrationOtp(User user)
    {
        var otp = Random.Shared.Next(100000, 999999).ToString();
        user.Otp = otp;
        user.OtpExpiresAt = DateTimeOffset.UtcNow.AddMinutes(GetRegistrationTokenMinutes());
        user.UpdatedAt = DateTimeOffset.UtcNow;
        return otp;
    }

    private static string SetLoginOtp(User user)
    {
        var otp = Random.Shared.Next(100000, 999999).ToString();
        user.Otp = otp;
        user.OtpExpiresAt = DateTimeOffset.UtcNow.AddMinutes(GetLoginOtpMinutes());
        user.UpdatedAt = DateTimeOffset.UtcNow;
        return otp;
    }

    private static bool IsOtpValid(User user, string otp)
    {
        var normalizedOtp = otp.Trim();

        return !string.IsNullOrWhiteSpace(user.Otp) &&
            user.OtpExpiresAt is not null &&
            user.Otp == normalizedOtp &&
            DateTimeOffset.UtcNow <= user.OtpExpiresAt;
    }

    private async Task<UserDto> CompleteLoginAsync(User user, string? clientIp)
    {
        user.LastLoginAt = DateTimeOffset.UtcNow;
        user.LastLoginIp = clientIp;
        user.Otp = null;
        user.OtpExpiresAt = null;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _users.UpdateAsync(user);
        return UserMapper.ToDto(user);
    }

    private bool RequiresLoginOtp(User user, string? clientIp)
    {
        if (user.LastLoginAt is null)
        {
            return true;
        }

        var lastLoginExpired = DateTimeOffset.UtcNow - user.LastLoginAt > TimeSpan.FromDays(GetLoginOtpIntervalDays());
        if (lastLoginExpired)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(clientIp) || string.IsNullOrWhiteSpace(user.LastLoginIp))
        {
            return false;
        }

        return !string.Equals(user.LastLoginIp, clientIp, StringComparison.Ordinal);
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static int GetRegistrationTokenMinutes() =>
        int.TryParse(Environment.GetEnvironmentVariable("AUTH_REGISTRATION_TOKEN_MINUTES"), out var minutes) ? minutes : 10;

    private static int GetLoginOtpMinutes() =>
        int.TryParse(Environment.GetEnvironmentVariable("AUTH_LOGIN_OTP_MINUTES"), out var minutes) ? minutes : 5;

    private static int GetLoginOtpIntervalDays() =>
        int.TryParse(Environment.GetEnvironmentVariable("AUTH_LOGIN_OTP_INTERVAL_DAYS"), out var days) ? days : 7;
}
