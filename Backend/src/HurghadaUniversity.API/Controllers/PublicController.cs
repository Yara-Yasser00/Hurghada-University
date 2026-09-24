using HurghadaUniversity.Application.Features.Public;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[AllowAnonymous]
public sealed class PublicController(ISender sender) : ApiControllerBase
{
    [HttpGet("site")]
    public async Task<IActionResult> GetSite(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetPublicSiteQuery(), cancellationToken));
}
