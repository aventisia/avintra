namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the configuration settings for an API key.
/// </summary>
public class APIKeyConfig
{
    /// <summary>
    /// Gets or sets the API key used for authentication or access control.
    /// This property is mandatory for the application to function correctly.
    /// </summary>
    public required string APIKey { get; set; }
}