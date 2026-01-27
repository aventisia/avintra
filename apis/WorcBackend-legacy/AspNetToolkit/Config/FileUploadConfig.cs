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
    /// The directory where temporary files will be uploaded.
    /// </summary>
    public required string TempUploadDirectory { get; set; }

    /// <summary>
    /// Configuration for the allowed file types, including extensions and size limits.
    /// </summary>
    public required AllowedFileTypesConfig AllowedFileTypes { get; set; }

}

/// <summary>
/// Represents the configuration for different types of files that can be uploaded.
/// </summary>

public class AllowedFileTypesConfig
{
    /// <summary>
    /// Configuration for picture files.
    /// </summary>
    public required FileTypeConfig Pictures { get; set; }

    /// <summary>
    /// Configuration for document files.
    /// </summary>
    public required FileTypeConfig Documents { get; set; }

    /// <summary>
    /// Configuration for video files.
    /// </summary>
    public required FileTypeConfig Videos { get; set; }

    /// <summary>
    /// Configuration for audio files.
    /// </summary>
    public required FileTypeConfig Audio { get; set; }
}

/// <summary>
/// Represents the configuration for a specific file type, including allowed
/// extensions and maximum size.
/// </summary>

public class FileTypeConfig
{
    /// <summary>
    /// List of allowed file extensions for this file type.
    /// </summary>
    public required List<string> AllowedFileExtensions { get; set; }

    /// <summary>
    /// Maximum allowed file size in megabytes (MB).
    /// </summary>
    public required int MaxSizeMB { get; set; }
    
}