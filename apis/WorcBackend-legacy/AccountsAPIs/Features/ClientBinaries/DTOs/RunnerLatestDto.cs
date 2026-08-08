namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the latest available version of the Runner App.
/// </summary>
public class RunnerLatestDto
{
    /// <summary>
    /// The latest version string (e.g. "1.2.3").
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// The download URL for the latest version.
    /// </summary>
    public string Url { get; set; } = string.Empty;
}
