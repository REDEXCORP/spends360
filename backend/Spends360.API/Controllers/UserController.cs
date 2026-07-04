using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Spends360.Application.Interfaces;
using Spends360.Application.Models.User;

namespace Spends360.API.Controllers;

[Authorize]
public class UserController(IUserService userService) : BaseApiController
{
    private readonly IUserService _userService = userService;

    [HttpGet("profile")]
    public async Task<ActionResult<UserProfileResponse>> GetProfile()
    {
        var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is null)
        {
            return Unauthorized();
        }

        return Ok(await _userService.GetProfileAsync(long.Parse(userId)));
    }
}
