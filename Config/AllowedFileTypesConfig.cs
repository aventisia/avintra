namespace AspNetToolkit.Config;

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

}