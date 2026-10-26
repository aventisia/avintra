namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a model record in the OnPrem system, facilitating operations such as installation, retrieval, and deletion through the API.
/// </summary>
[Table("ai_OnPremModels")]
public class OnPremModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, enabling multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type or category of the model provider.
    /// </summary>
    public OnPremModelProviderEnum ProviderType { get; set; }

    /// <summary>
    /// Gets or sets the URL or endpoint used to access the model within the Ollama system.
    /// </summary>
    [Required]
    public required string ProviderUrl { get; set; }

    /// <summary>
    /// Gets or sets the display name of the model as shown in the user interface.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the system-specific name of the model, used as its unique identifier within the Ollama system.
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
}
