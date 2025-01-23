namespace AspNetToolkit.Config;

/// <summary>
/// Represents the general configuration settings for the application.
/// </summary>
public class GeneralConfig
{
    /// <summary>
    /// Gets or sets the name of the application.
    /// </summary>
    public required string AppName { get; set; }

    /// <summary>
    /// Gets or sets the domain of the application.
    /// </summary>
    public required string AppDomain { get; set; }

    /// <summary>
    /// Gets or sets the company name.
    /// </summary>
    public required string Company { get; set; }

    /// <summary>
    /// Gets or sets the emails that will receive sales inquiries.
    /// </summary>
    public required string SalesEmails { get; set; }
}