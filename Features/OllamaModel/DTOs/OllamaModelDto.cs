namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for an Ollama model, including metadata, configuration settings,
/// installation status, and audit details (e.g., creation and modification information).
/// </summary>
public class OllamaModelDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the Ollama model.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the human-readable display name of the model used in the UI.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the model.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the system-specific name of the model, used as its unique identifier within the Ollama system.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public required string ModelName { get; set; }

    /// <summary>
    /// Gets or sets the category or type of the model (e.g., language model, task-specific model).
    /// </summary>
    public OllamaModelTypeEnum Type { get; set; }

    /// <summary>
    /// Indicates whether the model is installed or available for installation.
    /// </summary>
    public bool IsInstalled { get; set; }

    /// <summary>
    /// Gets or sets the base URL or endpoint for accessing the model within the Ollama system.
    /// </summary>
    [Required]
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the model is disabled. 
    /// A nullable value allows differentiation between 'true', 'false', and 'null' statuses.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the model record. 
    /// This field is for informational purposes only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model record was created. 
    /// This field is for informational purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the model record. 
    /// This field is for informational purposes only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the model record was last modified. 
    /// This field is for informational purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
