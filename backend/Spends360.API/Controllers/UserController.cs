using Microsoft.AspNetCore.Mvc;
using Spends360.API.Middleware;
using Spends360.Application.Exceptions;
using Spends360.Application.Interfaces;
using Spends360.Application.Models.User;

namespace Spends360.API.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var userId = GetAuthenticatedUserId();
        var profile = await _userService.GetProfileAsync(userId);
        return Ok(profile);
    }

    private long GetAuthenticatedUserId()
    {
        if (!HttpContext.Items.TryGetValue(JwtAuthMiddleware.UserIdItemKey, out var value) ||
            value is not long userId)
        {
            throw new AppException("Access denied: No token provided", 401);
        }

        return userId;
    }
}
