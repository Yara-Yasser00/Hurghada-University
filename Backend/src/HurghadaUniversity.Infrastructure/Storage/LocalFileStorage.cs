using HurghadaUniversity.Application.Abstractions.Storage;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace HurghadaUniversity.Infrastructure.Storage;

public sealed class LocalFileStorage(IOptions<MediaOptions> options, IHostEnvironment env) : IFileStorage
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"
    };

    public async Task<StoredFile> SaveAsync(
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var opts = options.Value;
        var ext = Path.GetExtension(originalFileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("File type is not allowed.");

        if (!opts.AllowedContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("Content type is not allowed.");

        if (content.CanSeek && content.Length > opts.MaxBytes)
            throw new InvalidOperationException($"File exceeds the {opts.MaxBytes / (1024 * 1024)} MB limit.");

        var root = Path.IsPathRooted(opts.RootPath)
            ? opts.RootPath
            : Path.Combine(env.ContentRootPath, opts.RootPath);

        var year = DateTime.UtcNow.Year.ToString();
        var folder = Path.Combine(root, year);
        Directory.CreateDirectory(folder);

        var safeName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var physicalPath = Path.Combine(folder, safeName);

        await using (var fs = File.Create(physicalPath))
        {
            await content.CopyToAsync(fs, cancellationToken);
            if (fs.Length > opts.MaxBytes)
            {
                fs.Close();
                File.Delete(physicalPath);
                throw new InvalidOperationException($"File exceeds the {opts.MaxBytes / (1024 * 1024)} MB limit.");
            }
        }

        var info = new FileInfo(physicalPath);
        var relativeUrl = $"/uploads/{year}/{safeName}";
        return new StoredFile(relativeUrl, safeName, contentType, info.Length);
    }
}
