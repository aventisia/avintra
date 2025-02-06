namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for file uploads, including the upload directory
/// and allowed file types.
/// </summary>
public class FileUploadConfig
{
    /// <summary>
    /// The directory where files will be uploaded.
    /// </summary>
    public required string UploadDirectory { get; set; }

    /// <summary>
    /// Configuration for the allowed file types, including extensions and size limits.
    /// </summary>
    public required AllowedFileTypesConfig AllowedFileTypes { get; set; }

}