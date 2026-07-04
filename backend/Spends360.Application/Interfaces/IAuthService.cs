using Spends360.Application.Models.Auth;

namespace Spends360.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
    Task<LoginSuccessResponse> VerifyRegistrationAsync(VerifyRegisterRequest request, string? clientIp);
    Task<LoginResponse> LoginAsync(LoginRequest request, string? clientIp);
    Task<LoginSuccessResponse> VerifyOtpAsync(VerifyOtpRequest request, string? clientIp);
}
