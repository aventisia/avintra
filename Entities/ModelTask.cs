namespace MLModelBuilderAPIs.Entities;

public class ModelTask : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant identifier for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the model task (required, max length 255).
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the configuration type of the task.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the LLM (Large Language Model) used.
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the secret key string.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the node prompt to guide the model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the model's randomness.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the optional setup information for the task.
    /// </summary>
    public string? SetupObject { get; set; }

    /// <summary>
    /// Stores the dynamically generated prompt as a string, typically created at runtime for use in model interactions or processing.
    /// </summary>
    public string? GeneratedPrompt { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated machine learning model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the associated machine learning model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// Gets or sets the extracted data associated with this data model
    /// </summary>
    public virtual ExtractedData? ExtractedData { get; set; }
}