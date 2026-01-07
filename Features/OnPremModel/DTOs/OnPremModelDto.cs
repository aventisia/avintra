namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing the details of an OnPrem model, including metadata,
/// configuration settings, installation status, and audit information (such as creation and modification details).
/// </summary>
public class OnPremModelDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the OnPrem model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the type or category of the model provider.
    /// </summary>
    public OnPremModelProviderEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the URL or endpoint used to access the model in the provider's system.
    /// </summary>
    [Required]
    public required string ProviderUrl { get; set; }

    /// <summary>
    /// Gets or sets the display name of the model as shown in the user interface.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the system-specific name of the model, serving as its unique identifier within the provider's system.
    /// </summary>
    [MaxLength(255)]
    public required string ModelName { get; set; }

    /// <summary>
    /// Gets or sets a brief description of the model.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the current installation status of the model.
    /// </summary>
    public OnPremModelStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the model is disabled. 
    /// A nullable value allows differentiation between 'true', 'false', and 'null'.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the model record. 
    /// This field is informational and should not be included in API requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model record was created. 
    /// This field is informational and should not be included in API requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the model record. 
    /// This field is informational and should not be included in API requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model record was last modified. 
    /// This field is informational and should not be included in API requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}