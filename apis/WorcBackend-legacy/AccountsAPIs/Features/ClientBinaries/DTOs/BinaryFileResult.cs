namespace AccountsAPIs.DTOs;

/// <summary>
/// Describes a binary file to be streamed to the client. Keeps the service layer
/// free of HTTP concerns so it can be unit tested; the controller maps this to a
/// <see cref="Microsoft.AspNetCore.Mvc.FileStreamResult"/> or a not-found response.
/// </summary>
public class BinaryFileResult
{
    /// <summary>
    /// The absolute path of the file to stream. Null when the file could not be resolved.
    /// </summary>
    public string? FilePath { get; set; }

    /// <summary>
    /// The file name to send as the download name.
    /// </summary>
    public string? FileName { get; set; }

    /// <summary>
    /// The MIME content type of the file. Defaults to "application/octet-stream".
    /// </summary>
    public string ContentType { get; set; } = "application/octet-stream";

    /// <summary>
    /// A message describing why the file could not be resolved, when applicable.
    /// </summary>
    public string? Message { get; set; }
}
