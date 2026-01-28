namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a downloadable file, including its content, MIME type, and name.
/// </summary>
public class FileStreamContentResponseDto
{
    /// <summary>
    /// The file content as a stream.
    /// </summary>
    public Stream Content { get; set; } = default!;

    /// <summary>
    /// The MIME type of the file. Defaults to "application/octet-stream".
    /// </summary>
    public string ContentType { get; set; } = "application/octet-stream";

    /// <summary>
    /// The name of the file, including extension.
    /// </summary>
    public string Name { get; set; } = string.Empty;
}
