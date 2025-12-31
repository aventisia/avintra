namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents a task associated with a specific project version, including LLM configuration, prompts, and setup schema. Supports multi-tenancy.
/// </summary>
[Table("as_VersionTasks")]
public class VersionTask : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant Id for multi-tenancy support.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the project this task belongs to.
    /// </summary>
    public required Guid AIProjectId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the project version this task belongs to.
    /// </summary>
    public required Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the AI task. Max 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Indicates whether the on-premises LLM (Large Language Model) is used.
    /// </summary>
    /// <remarks>
    /// If <see cref="IsBYOKEnabled"/> is false, the cloud provider LLM will be utilized for this task.
    /// </remarks>
    public bool IsBYOKEnabled { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the LLM cloud provider credential (saved in vault).
    /// </summary>
    public Guid? CloudLLMCredentialId { get; set; }

    /// <summary>
    /// Gets or sets the LLM (Large Language Model) used. Max 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string LLM { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the LLM's randomness.
    /// </summary>
    public required double Temperature { get; set; }

    /// <summary>
    /// Gets or sets the system prompt to guide the LLM's behavior.
    /// </summary>
    public required string SystemPrompt { get; set; }

    /// <summary>
    /// Gets or sets the task setup form's schema in string format.
    /// </summary>
    public string? SetupObject { get; set; }

    /// <summary>
    /// Gets or sets the generated prompt based on the task setup.
    /// </summary>
    /// <remarks>
    /// Whenever user saves the task setup, the generated prompt will be updated accordingly.
    /// </remarks>
    public string? GeneratedPrompt { get; set; }

    /// <summary>
    /// Gets or sets the project entity associated with this task.
    /// </summary>
    [ForeignKey("AIProjectId")]
    public virtual required AIProject AIProject { get; set; }

    /// <summary>
    /// Gets or sets the project version entity associated with this task.
    /// </summary>
    [ForeignKey("AIProjectVersionId")]
    public virtual required AIProjectVersion AIProjectVersion { get; set; }

    /// <summary>
    /// Gets or sets the extracted datas associated with this task.
    /// </summary>
    public virtual ICollection<ExtractedData>? ExtractedDatas { get; set; }
}

// namespace MLModelBuilderAPIs.Entities;

// public class ModelTask : BaseEntity, IMustHaveTenant
// {
//     /// <summary>
//     /// Gets or sets the tenant identifier for multi-tenancy filtering.
//     /// </summary>
//     public Guid TenantId { get; set; }

//     /// <summary>
//     /// Gets or sets the name of the model task (required, max length 255).
//     /// </summary>
//     [MaxLength(255)]
//     public required string Name { get; set; }

//     /// <summary>
//     /// Gets or sets the configuration type of the task.
//     /// </summary>
//     public required LLMConfigurationTypesEnum ConfigurationType { get; set; }

//     /// <summary>
//     /// Gets or sets the LLM (Large Language Model) used.
//     /// </summary>
//     public required string LLM { get; set; }

//     /// <summary>
//     /// Gets or sets the secret key string.
//     /// </summary>
//     public string? SecretKey { get; set; }

//     /// <summary>
//     /// Gets or sets the node prompt to guide the model's behavior.
//     /// </summary>
//     public required string NodePrompt { get; set; }

//     /// <summary>
//     /// Gets or sets the temperature setting for the model's randomness.
//     /// </summary>
//     public required double Temperature { get; set; }

//     /// <summary>
//     /// Gets or sets the optional setup information for the task.
//     /// </summary>
//     public string? SetupObject { get; set; }

//     /// <summary>
//     /// Stores the dynamically generated prompt as a string, typically created at runtime for use in model interactions or processing.
//     /// </summary>
//     public string? GeneratedPrompt { get; set; }

//     /// <summary>
//     /// Gets or sets the identifier of the associated machine learning model version.
//     /// </summary>
//     public Guid MLModelVersionId { get; set; }

//     /// <summary>
//     /// Gets or sets the navigation property for the associated machine learning model version.
//     /// </summary>
//     [ForeignKey("MLModelVersionId")]
//     public virtual MLModelVersion? MLModelVersion { get; set; }

//     /// <summary>
//     /// Gets or sets the identifier of the associated machine learning model.
//     /// </summary>
//     public Guid MLModelId { get; set; }

//     /// <summary>
//     /// Gets or sets the navigation property for the associated machine learning model.
//     /// </summary>
//     [ForeignKey("MLModelId")]
//     public virtual MLModel? MLModel { get; set; }

//     /// <summary>
//     /// Gets or sets the machine learning model task that this extracted data is associated with.
//     /// </summary>
//     public virtual ICollection<ExtractedData>? ExtractedData { get; set; }
// }