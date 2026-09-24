using HurghadaUniversity.Application.Features.Auth;
using HurghadaUniversity.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

public sealed class AuthController(ISender sender) : ApiControllerBase
{
    public sealed record LoginRequest(string Username, string Password, UserRole? PreferredRole);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new LoginCommand(request.Username, request.Password, request.PreferredRole), cancellationToken));
}
