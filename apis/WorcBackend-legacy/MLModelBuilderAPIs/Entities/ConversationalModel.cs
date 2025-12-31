namespace MLModelBuilderAPIs.Entities;

public class ConversationalModel : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant to support multi-tenancy.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the conversational model (required, max length 255 characters).
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the configuration type for the conversational model.
    /// </summary>
    public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

    /// <summary>
    /// Gets or sets the Large Language Model (LLM) used for the conversation.
    /// </summary>
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets an optional secret key string for additional security.
    /// </summary>
    public string? SecretKey { get; set; }

    /// <summary>
    /// Gets or sets the node prompt used to guide the conversational model's behavior.
    /// </summary>
    public required string NodePrompt { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting, controlling the model's randomness.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets optional setup information related to the conversational model.
    /// </summary>
    public string? SetupObject { get; set; }

    /// <summary>
    /// Stores a dynamically generated prompt, typically created at runtime for model interactions.
    /// </summary>
    public string? GeneratedPrompt { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the associated machine learning model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the associated machine learning model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual AIProject? AIProject { get; set; }
}
