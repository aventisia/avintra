namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a predefined task for executing AI-related operations. 
/// This task stores the configuration for LLM (Large Language Model) execution including the 
/// input prompts, model settings, and output preferences.
/// </summary>
[Table("worc_PromptTemplates")]
public class PromptTemplate : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi-tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the task, used to identify and reference it within the system.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the flow. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the access scope of the prompt template. This determines who can view and use the template (Self, Tenant, or Public).
    /// </summary>
    [Required]
    public required PromptTemplateAccessTypeEnum AccessType { get; set; }

    /// <summary>
    /// Gets or sets the system-level input prompt template for the task, providing context or instructions for the LLM to process.
    /// </summary>
    public required string SystemInput { get; set; }

    /// <summary>
    /// Gets or sets the name of the model provider (e.g., OpenAI, Anthropic, etc.) used for task execution.
    /// </summary>
    [MaxLength(255)]
    public required string ModelProvider { get; set; }

    /// <summary>
    /// Gets or sets the model name used by the LLM provider (e.g., GPT-4, Claude-2).
    /// </summary>
    [MaxLength(255)]
    public required string Model { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the output from the LLM should be in JSON format.
    /// </summary>
    public bool IsJsonOutput { get; set; }

    /// <summary>
    /// Gets or sets an optional JSON schema that defines the structure and validation rules for the JSON output, if applicable.
    /// </summary>
    public string? JsonSchema { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of tokens the LLM is allowed to generate in the output. This limits the length of the model’s response.
    /// </summary>
    public int MaxOutputTokens { get; set; }

    /// <summary>
    /// Gets or sets the temperature setting for the LLM, which controls the randomness of the model's output (higher values yield more random responses).
    /// </summary>
    public float Temperature { get; set; }

    /// <summary>
    /// Gets or sets the top-p setting for the LLM, which controls the diversity of the model's output (0.0 to 1.0 range).
    /// </summary>
    public float TopP { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the LLM response should be streamed, which can improve response time for larger outputs.
    /// </summary>
    public bool Stream { get; set; }
}