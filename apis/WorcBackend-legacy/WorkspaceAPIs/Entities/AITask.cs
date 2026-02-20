namespace WorkspaceAPIs.Entities;

/// <summary>
/// TODO: Since this is not Tenant specific, we can keep this entity in AccountsDb or WorcDb only on single place. Need to decide on that.
/// Represents a predefined task for executing AI-related operations. 
/// This task stores the configuration for LLM (Large Language Model) execution including the 
/// input prompts, model settings, and output preferences.
/// </summary>
[Table("worc_AITasks")]
public class AITask : BaseEntity
{
    /// <summary>
    /// Gets or sets the name of the task, used to identify and reference it within the system.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the system-level input prompt template for the task, providing context or instructions for the LLM to process.
    /// </summary>
    public string? SystemInput { get; set; }

    /// <summary>
    /// Gets or sets the user-level input prompt template, where dynamic user-provided data is injected for the task execution.
    /// </summary>
    public string? UserInput { get; set; }

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