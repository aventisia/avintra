namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a model record in the Ollama system, supporting operations like installation, retrieval, and deletion through the API.
/// </summary>
[Table("worc_OllamaModels")]
public class OllamaModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant's unique identifier for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the human-readable display name of the model used in the UI.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a description of the model.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the actual system name of the model (up to 255 characters).
    /// This is the unique identifier used within the Ollama system.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public required string ModelName { get; set; }

    /// <summary>
    /// Gets or sets the model's category/type.
    /// </summary>
    public OllamaModelTypeEnum Type { get; set; }

    /// <summary>
    /// Indicates whether the model is installed or available for installation.
    /// </summary>
    public bool IsInstalled { get; set; }

    /// <summary>
    /// Gets or sets the URL or endpoint for accessing the model in the Ollama system.
    /// </summary>
    [Required]
    public required string BaseUrl { get; set; }
}
