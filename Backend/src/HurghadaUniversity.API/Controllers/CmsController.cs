using HurghadaUniversity.Application.Features.Cms;
using HurghadaUniversity.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class CmsController(ISender sender) : ApiControllerBase
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetSiteProfileQuery(), cancellationToken));

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateSiteProfileCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpGet("news")]
    public async Task<IActionResult> GetNews(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetSiteNewsQuery(), cancellationToken));

    [HttpPost("news")]
    public async Task<IActionResult> CreateNews([FromBody] CreateSiteNewsCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("news/{id:guid}")]
    public async Task<IActionResult> UpdateNews(Guid id, [FromBody] UpdateSiteNewsBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateSiteNewsCommand(
            id, body.Category, body.CategoryEn, body.Title, body.TitleEn, body.Summary, body.SummaryEn,
            body.ImageUrl, body.PublishedLabel, body.IsFeatured, body.IsPublished, body.SortOrder), cancellationToken));

    [HttpDelete("news/{id:guid}")]
    public async Task<IActionResult> DeleteNews(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteSiteNewsCommand(id), cancellationToken));

    [HttpGet("events")]
    public async Task<IActionResult> GetEvents(CancellationToken cancellationToken)
        => FromResult(await sender.Send(new GetSiteEventsQuery(), cancellationToken));

    [HttpPost("events")]
    public async Task<IActionResult> CreateEvent([FromBody] CreateSiteEventCommand command, CancellationToken cancellationToken)
        => FromResult(await sender.Send(command, cancellationToken));

    [HttpPut("events/{id:guid}")]
    public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateSiteEventBody body, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new UpdateSiteEventCommand(
            id, body.Day, body.Month, body.MonthEn, body.Title, body.TitleEn, body.Location, body.LocationEn,
            body.Category, body.CategoryEn, body.IsPublished, body.SortOrder), cancellationToken));

    [HttpDelete("events/{id:guid}")]
    public async Task<IActionResult> DeleteEvent(Guid id, CancellationToken cancellationToken)
        => FromResult(await sender.Send(new DeleteSiteEventCommand(id), cancellationToken));

    public sealed record UpdateSiteNewsBody(
        string Category,
        string CategoryEn,
        string Title,
        string TitleEn,
        string Summary,
        string SummaryEn,
        string ImageUrl,
        string PublishedLabel,
        bool IsFeatured,
        bool IsPublished,
        int SortOrder);

    public sealed record UpdateSiteEventBody(
        string Day,
        string Month,
        string MonthEn,
        string Title,
        string TitleEn,
        string Location,
        string LocationEn,
        string Category,
        string CategoryEn,
        bool IsPublished,
        int SortOrder);
}
