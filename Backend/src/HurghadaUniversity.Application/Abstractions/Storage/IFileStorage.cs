namespace HurghadaUniversity.Application.Abstractions.Storage;

public interface IFileStorage
{
    /// <summary>Saves a file and returns a public relative path (e.g. /uploads/2026/abc.webp).</summary>
    Task<StoredFile> SaveAsync(
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken = default);
}

public sealed record StoredFile(
    string RelativeUrl,
    string FileName,
    string ContentType,
    long SizeBytes);
