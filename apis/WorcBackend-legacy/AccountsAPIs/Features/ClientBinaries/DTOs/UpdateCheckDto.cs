using System.Text.Json.Serialization;

namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the update-check response for the Desktop App.
/// </summary>
public class UpdateCheckDto
{
    /// <summary>
    /// The latest available version string.
    /// </summary>
    public string Version { get; set; } = string.Empty;

    /// <summary>
    /// Release notes for the latest version.
    /// </summary>
    public string Notes { get; set; } = "Bug fixes and improvements.";

    /// <summary>
    /// Publication date of the latest version in ISO 8601 format.
    /// </summary>
    [JsonPropertyName("pub_date")]
    public string PubDate { get; set; } = string.Empty;

    /// <summary>
    /// Per-platform download information keyed by platform identifier (e.g. "windows-x86_64").
    /// </summary>
    public Dictionary<string, UpdateCheckPlatformDto> Platforms { get; set; } = new();
}

/// <summary>
/// Platform-specific download information for an update.
/// </summary>
public class UpdateCheckPlatformDto
{
    /// <summary>
    /// The signature of the binary.
    /// </summary>
    public string Signature { get; set; } = string.Empty;

    /// <summary>
    /// The download URL for the binary.
    /// </summary>
    public string Url { get; set; } = string.Empty;
}
