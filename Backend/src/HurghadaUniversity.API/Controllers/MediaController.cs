using HurghadaUniversity.Application.Abstractions.Storage;
using HurghadaUniversity.Domain.Enums;
using HurghadaUniversity.Infrastructure.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HurghadaUniversity.API.Controllers;

[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class MediaController(
    IFileStorage storage,
    IOptions<MediaOptions> mediaOptions) : ApiControllerBase
{
    /// <summary>Upload an image or PDF. Returns a public URL to store on entities.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "A file is required." });

        var opts = mediaOptions.Value;
        if (file.Length > opts.MaxBytes)
            return BadRequest(new { message = $"File exceeds the {opts.MaxBytes / (1024 * 1024)} MB limit." });

        if (!opts.AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only JPEG, PNG, WebP, GIF, or PDF files are allowed." });

        try
        {
            await using var stream = file.OpenReadStream();
            var stored = await storage.SaveAsync(stream, file.FileName, file.ContentType, cancellationToken);
            var url = BuildPublicUrl(stored.RelativeUrl);
            return Ok(new
            {
                url,
                relativeUrl = stored.RelativeUrl,
                fileName = stored.FileName,
                contentType = stored.ContentType,
                sizeBytes = stored.SizeBytes
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private string BuildPublicUrl(string relativeUrl)
    {
        var configured = mediaOptions.Value.PublicBaseUrl?.TrimEnd('/');
        if (!string.IsNullOrWhiteSpace(configured))
            return $"{configured}{relativeUrl}";

        var request = HttpContext.Request;
        return $"{request.Scheme}://{request.Host}{relativeUrl}";
    }
}
