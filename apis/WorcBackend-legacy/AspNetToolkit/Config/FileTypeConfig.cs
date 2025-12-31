namespace AspNetToolkit.Config;

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