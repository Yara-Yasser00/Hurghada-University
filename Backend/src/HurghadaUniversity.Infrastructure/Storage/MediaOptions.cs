namespace HurghadaUniversity.Infrastructure.Storage;

public sealed class MediaOptions
{
    public const string SectionName = "Media";

    /// <summary>Physical folder under the content root (or absolute path).</summary>
    public string RootPath { get; set; } = "uploads";

    /// <summary>Optional absolute base (e.g. https://api.example.com). Empty = derive from request.</summary>
    public string? PublicBaseUrl { get; set; }

    public long MaxBytes { get; set; } = 5 * 1024 * 1024;

    public string[] AllowedContentTypes { get; set; } =
    [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf"
    ];
}
