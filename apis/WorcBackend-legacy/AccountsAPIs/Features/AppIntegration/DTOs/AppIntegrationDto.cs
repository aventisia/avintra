namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents detailed information about an app integration, including connection status, metadata, and audit fields.
/// </summary>
public class AppIntegrationDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the app integration.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the app integration. This field is required.
    /// </summary>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a short description of the app integration.
    /// This field is optional and limited to 500 characters.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the app integration is currently connected.
    /// </summary>
    public bool IsConnected { get; set; }

    /// <summary>
    /// Gets or sets the number of agents associated with this integration.
    /// </summary>
    public int AgentsConnected { get; set; }

    /// <summary>
    /// Gets or sets the website URL for the integration, if available.
    /// This field is optional and limited to 500 characters.
    /// </summary>
    public string? WebsiteUrl { get; set; }

    /// <summary>
    /// Gets or sets whether the integration is disabled.
    /// Nullable to allow for unknown or unset states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the integration record.
    /// Used for response purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the integration was created.
    /// Used for response purposes only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last updated the integration record.
    /// Used for response purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last update to the integration record.
    /// Used for response purposes only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
